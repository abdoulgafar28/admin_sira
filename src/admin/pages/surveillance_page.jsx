/*import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Fix Leaflet default icon paths broken by bundlers ────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Bobo-Dioulasso, Burkina Faso — centre par défaut ─────────────────────────
const MAP_CENTER = [11.177, -4.297];
const MAP_ZOOM   = 14;

// ── Données conducteurs simulées autour de Bobo-Dioulasso ───────────────────
const INITIAL_DRIVERS = [
  { id: 1, name: "Bakary Diélon",     lat: 11.183, lng: -4.302, status: "en_course",  tripId: "TRJ-001", speed: 28, km: 3.4  },
  { id: 2, name: "Ibrahima Fall",     lat: 11.179, lng: -4.290, status: "disponible", tripId: "TRJ-002", speed: 0,  km: 0    },
  { id: 3, name: "Souleymane Diallo", lat: 11.170, lng: -4.305, status: "en_course",  tripId: "TRJ-003", speed: 35, km: 7.1  },
  { id: 4, name: "Oumar Traoré",      lat: 11.187, lng: -4.285, status: "disponible", tripId: "TRJ-004", speed: 0,  km: 0    },
  { id: 5, name: "Moussa Konaté",     lat: 11.173, lng: -4.310, status: "en_course",  tripId: "TRJ-005", speed: 22, km: 2.8  },
  { id: 6, name: "Surfacé Cosma",     lat: 11.181, lng: -4.298, status: "alerte",     tripId: "TRJ-006", speed: 74, km: 12.3 },
];

// ── Icône SVG personnalisée par statut ────────────────────────────────────────
function makeIcon(status, selected = false) {
  const colors = {
    en_course:  { bg: "#1a4731", ring: "#2ecc71" },
    disponible: { bg: "#2ecc71", ring: "#a8f5c8" },
    alerte:     { bg: "#e74c3c", ring: "#ffaaaa" },
  };
  const c = colors[status] || colors.disponible;
  const size = selected ? 42 : 34;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 42 50">
      <circle cx="21" cy="21" r="20" fill="${c.ring}" opacity="0.35"/>
      <circle cx="21" cy="21" r="15" fill="${c.bg}" stroke="white" stroke-width="2.5"/>
      <text x="21" y="27" text-anchor="middle" font-size="14">🛵</text>
      <path d="M21 36 L17 42 L21 40 L25 42 Z" fill="${c.bg}"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize:   [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor:[0, -(size + 8)],
  });
}

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_META = {
  en_course:  { label: "En course",  color: "#1a4731", bg: "#e8f5e9" },
  disponible: { label: "Disponible", color: "#2d7a3c", bg: "#f0faf2" },
  alerte:     { label: "⚠ Alerte vitesse", color: "#c0392b", bg: "#fdecea" },
};

// ── Composant principal ───────────────────────────────────────────────────────
export default function Surveillance() {
  const mapRef        = useRef(null);
  const leafletRef    = useRef(null);
  const markersRef    = useRef({});
  const polylineRef   = useRef(null);

  const [drivers,        setDrivers]        = useState(INITIAL_DRIVERS);
  const [selectedId,     setSelectedId]     = useState(null);
  const [activeFilter,   setActiveFilter]   = useState("Tous");
  const [stats,          setStats]          = useState({ active: 3, total: 6, alerts: 1 });
  const [routeVisible,   setRouteVisible]   = useState(false);

  // ── Initialisation Leaflet ─────────────────────────────────────────────────
  useEffect(() => {
    if (leafletRef.current) return; // déjà initialisée

    const map = L.map(mapRef.current, {
      center: MAP_CENTER,
      zoom:   MAP_ZOOM,
      zoomControl: false,
    });

    // Tuiles OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Contrôle zoom custom (positionné en bas à droite)
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Échelle
    L.control.scale({ position: "bottomleft", metric: true, imperial: false }).addTo(map);

    leafletRef.current = map;

    return () => {
      map.remove();
      leafletRef.current = null;
    };
  }, []);

  // ── Placement / mise à jour des marqueurs ─────────────────────────────────
  const refreshMarkers = useCallback(() => {
    const map = leafletRef.current;
    if (!map) return;

    const filtered = drivers.filter(d => {
      if (activeFilter === "En course")  return d.status === "en_course";
      if (activeFilter === "Disponible") return d.status === "disponible";
      if (activeFilter === "Alertes")    return d.status === "alerte";
      return true;
    });

    // Supprimer les marqueurs hors filtre
    Object.keys(markersRef.current).forEach(id => {
      if (!filtered.find(d => d.id === parseInt(id))) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    filtered.forEach(driver => {
      const isSelected = driver.id === selectedId;
      const icon = makeIcon(driver.status, isSelected);
      const latlng = [driver.lat, driver.lng];

      if (markersRef.current[driver.id]) {
        markersRef.current[driver.id].setLatLng(latlng).setIcon(icon);
      } else {
        const marker = L.marker(latlng, { icon })
          .addTo(map)
          .on("click", () => setSelectedId(id => id === driver.id ? null : driver.id));
        markersRef.current[driver.id] = marker;
      }
    });
  }, [drivers, selectedId, activeFilter]);

  useEffect(() => { refreshMarkers(); }, [refreshMarkers]);

  // ── Simulation mouvement temps réel ───────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prev => prev.map(d => {
        if (d.status === "en_course" || d.status === "alerte") {
          return {
            ...d,
            lat: d.lat + (Math.random() - 0.5) * 0.0004,
            lng: d.lng + (Math.random() - 0.5) * 0.0004,
            km:  +(d.km + 0.01).toFixed(2),
          };
        }
        return d;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ── Trajet simulé (polyline) ───────────────────────────────────────────────
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }
    if (!routeVisible || !selectedId) return;

    const d = drivers.find(dr => dr.id === selectedId);
    if (!d) return;

    // Génère un trajet fictif de 5 points autour du conducteur
    const points = [[d.lat, d.lng]];
    for (let i = 1; i <= 5; i++) {
      points.push([d.lat + i * 0.003 - 0.005, d.lng + i * 0.002 + 0.001]);
    }

    polylineRef.current = L.polyline(points, {
      color: "#1a6ef5", weight: 4,
      dashArray: "10 6", opacity: 0.85,
    }).addTo(map);
  }, [routeVisible, selectedId, drivers]);

  // ── Centrer sur conducteur sélectionné ───────────────────────────────────
  useEffect(() => {
    if (!selectedId || !leafletRef.current) return;
    const d = drivers.find(dr => dr.id === selectedId);
    if (d) leafletRef.current.flyTo([d.lat, d.lng], 16, { animate: true, duration: 1 });
  }, [selectedId]);

  const selectedDriver = drivers.find(d => d.id === selectedId);
  const filters = ["Tous", "En course", "Disponible", "Alertes"];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      
      <div style={{
        position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6, zIndex: 1000,
        background: "rgba(255,255,255,0.97)",
        borderRadius: 24, padding: "6px 10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: "6px 16px", borderRadius: 18, border: "none", cursor: "pointer",
              background: activeFilter === f ? "#1a4731" : "transparent",
              color: activeFilter === f ? "#fff" : "#555",
              fontSize: 12, fontWeight: activeFilter === f ? 700 : 400,
              transition: "all 0.2s",
            }}
          >{f}</button>
        ))}
      </div>

      
      <div style={{
        position: "absolute", top: 16, left: 16, zIndex: 1000,
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        {[
          { label: "Actifs",       value: drivers.filter(d => d.status === "en_course").length,  color: "#1a4731" },
          { label: "Disponibles",  value: drivers.filter(d => d.status === "disponible").length, color: "#2ecc71" },
          { label: "Alertes",      value: drivers.filter(d => d.status === "alerte").length,     color: "#e74c3c" },
        ].map(s => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.97)",
            borderRadius: 10, padding: "8px 14px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            display: "flex", alignItems: "center", gap: 8,
            minWidth: 130,
          }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#1a2332", flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      
      {selectedDriver && (
        <div style={{
          position: "absolute", top: 16, right: 16, zIndex: 1000,
          background: "#fff", borderRadius: 14, padding: "16px 18px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)", width: 240,
          animation: "slideIn 0.2s ease",
        }}>
          <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(10px) } to { opacity:1; transform:translateX(0) } }`}</style>

          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2332", marginBottom: 4 }}>
                {selectedDriver.name}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, borderRadius: 10,
                padding: "2px 10px",
                background: STATUS_META[selectedDriver.status]?.bg,
                color:      STATUS_META[selectedDriver.status]?.color,
              }}>
                {STATUS_META[selectedDriver.status]?.label}
              </span>
            </div>
            <button onClick={() => { setSelectedId(null); setRouteVisible(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa", lineHeight: 1 }}>×</button>
          </div>

          
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[
              { label: "Trajet ID",  value: selectedDriver.tripId },
              { label: "Vitesse",    value: `${selectedDriver.speed} km/h` },
              { label: "Distance",   value: `${selectedDriver.km} km` },
              { label: "Coords",     value: `${selectedDriver.lat.toFixed(4)}, ${selectedDriver.lng.toFixed(4)}` },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#888" }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: "#1a2332" }}>{row.value}</span>
              </div>
            ))}
          </div>

          
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button
              onClick={() => setRouteVisible(v => !v)}
              style={{
                flex: 1, padding: "7px 0", borderRadius: 8, border: "none",
                background: routeVisible ? "#1a4731" : "#eaf3de",
                color: routeVisible ? "#fff" : "#1a4731",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}
            >
              {routeVisible ? "Masquer trajet" : "Voir trajet"}
            </button>
            <button
              onClick={() => {
                if (leafletRef.current) {
                  leafletRef.current.flyTo([selectedDriver.lat, selectedDriver.lng], 17, { animate: true, duration: 1 });
                }
              }}
              style={{
                flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid #e0e4ea",
                background: "#fff", color: "#1a2332",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}
            >
              Centrer
            </button>
          </div>
        </div>
      )}

      
      <div style={{
        position: "absolute", bottom: 40, left: "50%",
        transform: "translateX(-50%)", zIndex: 1000,
        background: "rgba(26,71,49,0.92)", color: "#fff",
        borderRadius: 20, padding: "6px 16px",
        fontSize: 11, fontWeight: 600, letterSpacing: "0.5px",
        display: "flex", alignItems: "center", gap: 8,
        backdropFilter: "blur(4px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: "#2ecc71",
          boxShadow: "0 0 0 3px rgba(46,204,113,0.35)",
          animation: "pulse 1.5s ease-in-out infinite",
          display: "inline-block",
        }} />
        LIVE · Mise à jour toutes les 3s · {drivers.length} conducteurs
        <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 3px rgba(46,204,113,0.35)} 50%{box-shadow:0 0 0 6px rgba(46,204,113,0.1)} }`}</style>
      </div>

      
      <div style={{
        position: "absolute", bottom: 40, left: 16, zIndex: 1000,
        background: "rgba(255,255,255,0.97)", borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        padding: "10px 12px", minWidth: 200, maxHeight: 200, overflowY: "auto",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Conducteurs ({drivers.length})
        </div>
        {drivers.map(d => (
          <div
            key={d.id}
            onClick={() => setSelectedId(id => id === d.id ? null : d.id)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 6px", borderRadius: 8, cursor: "pointer",
              background: selectedId === d.id ? "#eaf3de" : "transparent",
              marginBottom: 2, transition: "background 0.15s",
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: d.status === "en_course" ? "#1a4731" : d.status === "alerte" ? "#e74c3c" : "#2ecc71",
            }} />
            <span style={{ fontSize: 12, color: "#1a2332", flex: 1 }}>{d.name}</span>
            {d.status === "en_course" && (
              <span style={{ fontSize: 10, color: "#1a4731", fontWeight: 600 }}>{d.speed} km/h</span>
            )}
            {d.status === "alerte" && (
              <span style={{ fontSize: 10, color: "#e74c3c", fontWeight: 700 }}>⚠</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}*/








import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../services/axios_instance";

// ── Fix Leaflet default icon paths ────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MAP_CENTER = [11.177, -4.297];
const MAP_ZOOM   = 14;

const WS_URL = "ws://localhost:8001/ws/surveillance/";

/* ─── Icône personnalisée par statut ────────────────────────────────── */
function makeIcon(status, selected = false) {
  const colors = {
    en_course:  { bg: "#1a4731", ring: "#2ecc71" },
    disponible: { bg: "#2ecc71", ring: "#a8f5c8" },
    alerte:     { bg: "#e74c3c", ring: "#ffaaaa" },
  };
  const c = colors[status] || colors.disponible;
  const size = selected ? 42 : 34;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 42 50">
      <circle cx="21" cy="21" r="20" fill="${c.ring}" opacity="0.35"/>
      <circle cx="21" cy="21" r="15" fill="${c.bg}" stroke="white" stroke-width="2.5"/>
      <text x="21" y="27" text-anchor="middle" font-size="14">🛵</text>
      <path d="M21 36 L17 42 L21 40 L25 42 Z" fill="${c.bg}"/>
    </svg>`;
  return L.divIcon({
    html: svg, className: "",
    iconSize:   [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor:[0, -(size + 8)],
  });
}

const STATUS_META = {
  en_course:  { label: "En course",   color: "#1a4731", bg: "#e8f5e9" },
  disponible: { label: "Disponible",  color: "#2d7a3c", bg: "#f0faf2" },
  alerte:     { label: "⚠ Alerte",   color: "#c0392b", bg: "#fdecea" },
};

/* ════════════════════════════════════════════════════════════════════ */
export default function Surveillance() {
  const mapRef        = useRef(null);
  const leafletRef    = useRef(null);
  const markersRef    = useRef({});
  const polylineRef   = useRef(null);
  const wsRef         = useRef(null);

  const [drivers,        setDrivers]        = useState([]);
  const [stats,          setStats]          = useState({ total_actifs: 0, disponibles: 0, en_course: 0, alertes: 0 });
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [selectedId,     setSelectedId]     = useState(null);
  const [activeFilter,   setActiveFilter]   = useState("Tous");
  const [routeVisible,   setRouteVisible]   = useState(false);
  const [wsConnected,    setWsConnected]    = useState(false);

  /* ── Connexion WebSocket ──────────────────────────────────────────── */
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;


    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.error("❌ Pas de token admin, connexion WebSocket impossible");
      setLoading(false);
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connecté");
      setWsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "initial") {
        setDrivers(message.drivers || []);
        if (message.stats) setStats(message.stats);
        setLoading(false);
      } else if (message.type === "location_update") {
        const d = message.data;
        setDrivers(prev => prev.map(dr =>
          String(dr.id) === String(d.driver_id)
            ? { ...dr, lat: d.lat, lng: d.lng, status: d.status, speed: d.speed }
            : dr
        ));
      } else if (message.type === "status_change") {
        const d = message.data;
        setDrivers(prev => prev.map(dr =>
          String(dr.id) === String(d.driver_id)
            ? { ...dr, status: d.status, tripId: d.trip_id }
            : dr
        ));
      }
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket déconnecté, reconnexion dans 5s...");
      setWsConnected(false);
      setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (err) => {
      console.error("❌ Erreur WebSocket:", err);
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  /* ── Initialisation Leaflet ───────────────────────────────────────── */
  useEffect(() => {
    if (leafletRef.current) return;
    const map = L.map(mapRef.current, { center: MAP_CENTER, zoom: MAP_ZOOM, zoomControl: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.scale({ position: "bottomleft", metric: true, imperial: false }).addTo(map);
    leafletRef.current = map;
    return () => { map.remove(); leafletRef.current = null; };
  }, []);

  /* ── Marqueurs ────────────────────────────────────────────────────── */
  const refreshMarkers = useCallback(() => {
    const map = leafletRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    const filtered = drivers.filter(d => {
      if (activeFilter === "En course")  return d.status === "en_course";
      if (activeFilter === "Disponible") return d.status === "disponible";
      if (activeFilter === "Alertes")    return d.status === "alerte";
      return true;
    });

    filtered.forEach(driver => {
      if (!driver.lat || !driver.lng) return;
      const isSelected = String(driver.id) === String(selectedId);
      const icon = makeIcon(driver.status, isSelected);
      const marker = L.marker([driver.lat, driver.lng], { icon })
        .addTo(map)
        .on("click", () => setSelectedId(id => String(id) === String(driver.id) ? null : driver.id));
      markersRef.current[driver.id] = marker;
    });
  }, [drivers, selectedId, activeFilter]);

  useEffect(() => { refreshMarkers(); }, [refreshMarkers]);

  /* ── Polyline trajet ──────────────────────────────────────────────── */
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }
    if (!routeVisible || !selectedId) return;

    const d = drivers.find(dr => String(dr.id) === String(selectedId));
    if (!d?.trip_id) return;

    API.get(`/tracking/ride/${d.tripId}/path/`)
      .then(({ data }) => {
        if (data.success && data.data?.length >= 2) {
          polylineRef.current = L.polyline(
            data.data.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]),
            { color: "#1a6ef5", weight: 4, dashArray: "10 6", opacity: 0.85 }
          ).addTo(map);
        }
      })
      .catch(() => {});
  }, [routeVisible, selectedId, drivers]);

  /* ── Centrer sur sélection ────────────────────────────────────────── */
  useEffect(() => {
    if (!selectedId || !leafletRef.current) return;
    const d = drivers.find(dr => String(dr.id) === String(selectedId));
    if (d?.lat && d?.lng) {
      leafletRef.current.flyTo([d.lat, d.lng], 16, { animate: true, duration: 1 });
    }
  }, [selectedId]);

  const selectedDriver = drivers.find(d => String(d.id) === String(selectedId));
  const filters = ["Tous", "En course", "Disponible", "Alertes"];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Carte */}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* Chargement */}
      {loading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, background: "rgba(255,255,255,.7)" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "20px 30px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 14, color: "#1a4731", fontWeight: 600 }}>
            Connexion au serveur de surveillance...
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 1000, background: "rgba(255,255,255,0.97)", borderRadius: 24, padding: "6px 10px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            style={{ padding: "6px 16px", borderRadius: 18, border: "none", cursor: "pointer", background: activeFilter === f ? "#1a4731" : "transparent", color: activeFilter === f ? "#fff" : "#555", fontSize: 12, fontWeight: activeFilter === f ? 700 : 400, transition: "all 0.2s" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 1000, display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { label: "En course",   value: stats.en_course,   color: "#1a4731" },
          { label: "Disponibles", value: stats.disponibles,  color: "#2ecc71" },
          { label: "Alertes",     value: stats.alertes,      color: "#e74c3c" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.97)", borderRadius: 10, padding: "8px 14px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 8, minWidth: 130 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#1a2332", flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Panel conducteur */}
      {selectedDriver && (
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 1000, background: "#fff", borderRadius: 14, padding: "16px 18px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", width: 240, animation: "slideIn 0.2s ease" }}>
          <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}`}</style>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2332", marginBottom: 4 }}>{selectedDriver.name}</div>
              <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 10, padding: "2px 10px", background: (STATUS_META[selectedDriver.status] || STATUS_META.disponible).bg, color: (STATUS_META[selectedDriver.status] || STATUS_META.disponible).color }}>
                {(STATUS_META[selectedDriver.status] || STATUS_META.disponible).label}
              </span>
            </div>
            <button onClick={() => { setSelectedId(null); setRouteVisible(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa", lineHeight: 1 }}>×</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[
              { label: "Trajet ID", value: selectedDriver.tripId || "—" },
              { label: "Vitesse",   value: `${selectedDriver.speed || 0} km/h` },
              { label: "Téléphone", value: selectedDriver.phone || "—" },
              { label: "Coords",    value: `${selectedDriver.lat?.toFixed(4)}, ${selectedDriver.lng?.toFixed(4)}` },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#888" }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: "#1a2332" }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button onClick={() => setRouteVisible(v => !v)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", background: routeVisible ? "#1a4731" : "#eaf3de", color: routeVisible ? "#fff" : "#1a4731", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
              {routeVisible ? "Masquer trajet" : "Voir trajet"}
            </button>
            <button onClick={() => { if (leafletRef.current && selectedDriver.lat && selectedDriver.lng) leafletRef.current.flyTo([selectedDriver.lat, selectedDriver.lng], 17, { animate: true, duration: 1 }); }} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid #e0e4ea", background: "#fff", color: "#1a2332", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
              Centrer
            </button>
          </div>
        </div>
      )}

      {/* LIVE indicator avec statut WebSocket */}
      <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: wsConnected ? "rgba(26,71,49,0.92)" : "rgba(200,150,0,0.92)", color: "#fff", borderRadius: 20, padding: "6px 16px", fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(4px)", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: wsConnected ? "#2ecc71" : "#f0a500", boxShadow: wsConnected ? "0 0 0 3px rgba(46,204,113,0.35)" : "0 0 0 3px rgba(240,165,0,0.35)", animation: "pulse 1.5s ease-in-out infinite", display: "inline-block" }} />
        {wsConnected ? `LIVE · Temps réel · ${drivers.length} conducteurs` : `En attente de connexion... · ${drivers.length} conducteurs`}
        <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 3px rgba(46,204,113,0.35)}50%{box-shadow:0 0 0 6px rgba(46,204,113,0.1)}}`}</style>
      </div>

      {/* Liste conducteurs */}
      <div style={{ position: "absolute", bottom: 40, left: 16, zIndex: 1000, background: "rgba(255,255,255,0.97)", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", padding: "10px 12px", minWidth: 200, maxHeight: 200, overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Conducteurs ({drivers.length})</div>
        {drivers.length === 0 && !loading && (
          <div style={{ fontSize: 12, color: "#999", textAlign: "center", padding: "10px 0" }}>Aucun conducteur</div>
        )}
        {drivers.map(d => (
          <div key={d.id} onClick={() => setSelectedId(id => String(id) === String(d.id) ? null : d.id)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 6px", borderRadius: 8, cursor: "pointer", background: String(selectedId) === String(d.id) ? "#eaf3de" : "transparent", marginBottom: 2, transition: "background 0.15s" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: d.status === "en_course" ? "#1a4731" : d.status === "alerte" ? "#e74c3c" : "#2ecc71" }} />
            <span style={{ fontSize: 12, color: "#1a2332", flex: 1 }}>{d.name}</span>
            {d.status === "en_course" && <span style={{ fontSize: 10, color: "#1a4731", fontWeight: 600 }}>{d.speed} km/h</span>}
            {d.status === "alerte" && <span style={{ fontSize: 10, color: "#e74c3c", fontWeight: 700 }}>⚠</span>}
          </div>
        ))}
      </div>
    </div>
  );
}