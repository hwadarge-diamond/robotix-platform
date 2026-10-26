"""
Hotspot Detection & Heatmap Service.
Implements spatial DBSCAN coordinate clustering and grid-based risk intensity estimation.
"""

import math
from typing import List, Dict, Any
from app.database import get_db, haversine_distance_meters

def dbscan_cluster_incidents(eps_meters: float = 250.0, min_samples: int = 2) -> List[Dict[str, Any]]:
    """
    DBSCAN spatial clustering implementation on incident coordinates.
    Groups incidents into hotspots with cluster center, bounding radius, and risk level.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, incident_type, severity, latitude, longitude, time_of_day FROM incidents")
        incidents = [dict(r) for r in cursor.fetchall()]

    if not incidents:
        return []

    n = len(incidents)
    visited = [False] * n
    cluster_labels = [-1] * n  # -1 = noise
    current_cluster_id = 1

    def region_query(point_idx: int) -> List[int]:
        neighbors = []
        p1 = incidents[point_idx]
        for idx, p2 in enumerate(incidents):
            dist = haversine_distance_meters(p1["latitude"], p1["longitude"], p2["latitude"], p2["longitude"])
            if dist <= eps_meters:
                neighbors.append(idx)
        return neighbors

    for i in range(n):
        if visited[i]:
            continue
        visited[i] = True
        neighbors = region_query(i)

        if len(neighbors) < min_samples:
            cluster_labels[i] = -1  # noise
        else:
            # Form cluster
            cluster_labels[i] = current_cluster_id
            queue = [idx for idx in neighbors if idx != i]

            while queue:
                neighbor_idx = queue.pop(0)
                if not visited[neighbor_idx]:
                    visited[neighbor_idx] = True
                    sub_neighbors = region_query(neighbor_idx)
                    if len(sub_neighbors) >= min_samples:
                        queue.extend([sn for sn in sub_neighbors if sn not in queue])

                if cluster_labels[neighbor_idx] == -1:
                    cluster_labels[neighbor_idx] = current_cluster_id

            current_cluster_id += 1

    # Aggregate clusters
    clusters: Dict[int, List[Dict[str, Any]]] = {}
    for idx, cid in enumerate(cluster_labels):
        if cid != -1:
            clusters.setdefault(cid, []).append(incidents[idx])

    hotspots = []
    with get_db() as conn:
        cursor = conn.cursor()
        # Refresh hotspots table
        cursor.execute("DELETE FROM hotspots")

        for cid, points in clusters.items():
            count = len(points)
            avg_lat = sum(p["latitude"] for p in points) / count
            avg_lon = sum(p["longitude"] for p in points) / count

            # Max distance to center + 50m margin
            max_dist = max(
                haversine_distance_meters(avg_lat, avg_lon, p["latitude"], p["longitude"])
                for p in points
            )
            radius = max(120.0, max_dist + 50.0)

            # Determine dominant category and risk level
            severities = [p.get("severity", "medium") for p in points]
            if "critical" in severities or count >= 5:
                risk_level = "severe"
            elif "high" in severities or count >= 3:
                risk_level = "high"
            else:
                risk_level = "medium"

            primary_cat = points[0].get("incident_type", "hazard")
            tods = [p.get("time_of_day", "night") for p in points]
            time_sens = max(set(tods), key=tods.count)

            cursor.execute("""
            INSERT INTO hotspots (
                cluster_id, center_latitude, center_longitude, radius_meters,
                incident_count, risk_level, primary_category, time_sensitivity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (cid, avg_lat, avg_lon, radius, count, risk_level, primary_cat, time_sens))

            hotspots.append({
                "cluster_id": cid,
                "center_latitude": avg_lat,
                "center_longitude": avg_lon,
                "radius_meters": radius,
                "incident_count": count,
                "risk_level": risk_level,
                "primary_category": primary_cat,
                "time_sensitivity": time_sens
            })

    return hotspots

def generate_risk_heatmap_cells(grid_steps: int = 12) -> List[Dict[str, Any]]:
    """Generate spatial risk density grid cells for map heatmap visualization."""
    from app.config import CITY_BBOX
    s, w, n, e = CITY_BBOX
    lat_step = (n - s) / grid_steps
    lon_step = (e - w) / grid_steps

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT latitude, longitude, severity FROM incidents")
        incidents = [dict(r) for r in cursor.fetchall()]

    cells = []
    for i in range(grid_steps):
        for j in range(grid_steps):
            cell_lat = s + (i + 0.5) * lat_step
            cell_lon = w + (j + 0.5) * lon_step

            # Weight incidents by distance
            intensity = 0.0
            for inc in incidents:
                dist = haversine_distance_meters(cell_lat, cell_lon, inc["latitude"], inc["longitude"])
                if dist <= 800.0:
                    weight = 1.0 if inc.get("severity") == "high" else 0.6
                    intensity += weight * (1.0 - (dist / 800.0))

            if intensity > 0.15:
                cells.append({
                    "lat": round(cell_lat, 5),
                    "lon": round(cell_lon, 5),
                    "intensity": round(min(1.0, intensity / 3.0), 2)
                })

    return cells
