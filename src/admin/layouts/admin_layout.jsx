import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Typography, Badge,
  Menu, MenuItem, Box, Avatar, InputBase, Button,
  Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Tooltip, Divider,
} from '@mui/material';
import {
  MenuOpen, Notifications, ChatBubbleOutline,
  Search, TuneRounded, Dashboard, VerifiedUser,
  Group, Shield, Visibility, PriceChange,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import API from '../../services/axios_instance';

const DRAWER_WIDTH = 230;

const NAV_ITEMS = [
  { label: 'Tableau de Bord',        path: '/dashboard',    icon: <Dashboard    fontSize="small" /> },
  { label: 'Validation Conducteurs', path: '/drivers',      icon: <VerifiedUser fontSize="small" /> },
  { label: 'Gestion des courses',   path: '/courses',      icon: <Group        fontSize="small" /> },
  { label: 'Contrôle Anti-fraude',   path: '/antifraude',   icon: <Shield       fontSize="small" /> },
  { label: 'Surveillance',           path: '/surveillance', icon: <Visibility   fontSize="small" /> },
  { label: 'Gestion des Opérations', path: '/operations',   icon: <TuneRounded  fontSize="small" /> },
  { label: 'Paramétrage Tarifs',     path: '/pricing',      icon: <PriceChange  fontSize="small" /> },
];

function usePageTitle() {
  const location = useLocation();
  const match = NAV_ITEMS.find(item => location.pathname.startsWith(item.path));
  return match?.label ?? 'Administration';
}

/* ─── Sidebar ─────────────────────────────────────────────────────────── */
function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Déconnexion avec appel API
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('adminRefreshToken');
      if (refreshToken) {
        await API.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (err) {
      console.error("Erreur déconnexion:", err);
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    navigate('/login');
    toast.success("Déconnecté avec succès");
  };

  const drawerContent = (
    <Box sx={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(180deg, #1a4731 0%, #0f2d1e 100%)',
    }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2.75, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <img src="/sira__logo.png" alt="SiRA" style={{ height: 38, width: 'auto', borderRadius: 8 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '1.5px', lineHeight: 1.1 }}>
            SiRA<span style={{ color: '#2ecc71' }}>.</span>
          </Box>
          <Box sx={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1 }}>
            OPS Center
          </Box>
        </Box>
      </Box>

      <List sx={{ px: 1, pt: 1.5, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); onClose(); }}
                sx={{
                  borderRadius: 2,
                  borderLeft: active ? '3px solid #f0a500' : '3px solid transparent',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                  '&:hover': { background: 'rgba(255,255,255,0.08)', color: '#fff' },
                  py: 1.25, px: 1.75,
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* ✅ Déconnexion */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2, color: 'rgba(255,255,255,0.45)',
            '&:hover': { background: 'rgba(255,60,60,0.12)', color: '#ff9999' },
          }}
        >
          <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontSize: 12 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
      <Drawer variant="temporary" open={mobileOpen} onClose={onClose} ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}>
        {drawerContent}
      </Drawer>
      <Drawer variant="permanent"
        sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', boxShadow: '2px 0 12px rgba(0,0,0,0.15)' } }}>
        {drawerContent}
      </Drawer>
    </Box>
  );
}

/* ─── AdminLayout ─────────────────────────────────────────────────────── */
export default function AdminLayout() {
  const pageTitle = usePageTitle();
  const navigate = useNavigate();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [anchorEl,    setAnchorEl]    = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [msgAnchor,   setMsgAnchor]   = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const handleClose = () => {
    setAnchorEl(null);
    setNotifAnchor(null);
    setMsgAnchor(null);
  };

  // ✅ Déconnexion AppBar
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('adminRefreshToken');
      if (refreshToken) {
        await API.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (err) {
      console.error("Erreur déconnexion:", err);
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    handleClose();
    navigate('/login');
    toast.success("Déconnecté avec succès");
  };

  // ✅ Recherche
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      toast.info(`Recherche : "${searchValue}"`);
      setSearchValue("");
    }
  };

  // ✅ Définir tarifs → redirige vers /pricing
  const handleTarifs = () => {
    navigate('/pricing');
  };

  // ✅ Notifications
  const handleNotification = (path) => {
    handleClose();
    navigate(path);
  };

  // ✅ Messages
  const handleMessage = (msg) => {
    handleClose();
    toast.info(`Message : ${msg}`);
  };

  // ✅ Profil
  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  // ✅ Paramètres
  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box sx={{
        flex: 1, display: 'flex', flexDirection: 'column',
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        overflow: 'hidden',
      }}>
        {/* ── AppBar ──────────────────────────────────────────── */}
        <AppBar position="static" elevation={0} sx={{
          backgroundColor: '#fff', color: 'text.primary',
          borderBottom: '1px solid #e8ecf0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexShrink: 0,
        }}>
          <Toolbar sx={{ minHeight: 60, px: '24px !important', gap: 1.5 }}>

            <IconButton color="inherit" edge="start"
              sx={{ display: { sm: 'none' }, mr: 1 }}
              onClick={() => setMobileOpen(true)}>
              <MenuOpen />
            </IconButton>

            <Typography variant="h6" noWrap
              sx={{ flexGrow: 1, fontWeight: 700, fontSize: 17, color: '#1a2332' }}>
              {pageTitle}
            </Typography>

            {/* ✅ Définir les tarifs → redirige vers /pricing */}
            <Tooltip title="Paramétrer les tarifs">
              <Button
                onClick={handleTarifs}
                startIcon={<TuneRounded sx={{ fontSize: 16 }} />}
                size="small" variant="outlined"
                sx={{
                  textTransform: 'none', fontSize: 13, fontWeight: 600,
                  borderRadius: 2, borderColor: '#1a4731', color: '#1a4731', px: 2,
                  '&:hover': { background: '#eaf3de', borderColor: '#1a4731' },
                }}
              >
                Définir les tarifs
              </Button>
            </Tooltip>

            {/* ✅ Recherche */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              background: '#f5f7fa', borderRadius: 2, px: 1.5, py: 0.75,
              border: '1px solid #e0e4ea',
            }}>
              <Search sx={{ fontSize: 16, color: '#aaa' }} />
              <InputBase
                placeholder="Rechercher..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearch}
                sx={{ fontSize: 13, width: 140, color: '#555' }}
              />
            </Box>

            {/* ✅ Notifications */}
            <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={iconBtnSx}>
              <Badge badgeContent={3} color="error">
                <Notifications sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>
            <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={handleClose}>
              <MenuItem onClick={() => handleNotification('/drivers')} sx={{ fontSize: 13 }}>
                🔔 Nouveau conducteur à valider
              </MenuItem>
              <MenuItem onClick={() => handleNotification('/disputes')} sx={{ fontSize: 13 }}>
                ⚠️ Litige en attente
              </MenuItem>
              <MenuItem onClick={() => handleNotification('/antifraude')} sx={{ fontSize: 13 }}>
                🚨 Anomalie sur trajet
              </MenuItem>
            </Menu>

            {/* ✅ Messages */}
            <IconButton onClick={(e) => setMsgAnchor(e.currentTarget)} sx={iconBtnSx}>
              <Badge badgeContent={5} sx={{ '& .MuiBadge-badge': { background: '#f0a500' } }}>
                <ChatBubbleOutline sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>
            <Menu anchorEl={msgAnchor} open={Boolean(msgAnchor)} onClose={handleClose}>
              <MenuItem onClick={() => handleMessage('Conducteur #12')} sx={{ fontSize: 13 }}>
                💬 Message Conducteur #12
              </MenuItem>
              <MenuItem onClick={() => handleMessage('Support #44')} sx={{ fontSize: 13 }}>
                💬 Support — demande #44
              </MenuItem>
            </Menu>

            {/* ✅ Profil */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
              <Avatar sx={{
                width: 36, height: 36, fontSize: 14,
                background: 'linear-gradient(135deg, #1a4731, #2ecc71)',
              }}>A</Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={handleProfile} sx={{ fontSize: 13 }}>👤 Mon profil</MenuItem>
              <MenuItem onClick={handleSettings} sx={{ fontSize: 13 }}>⚙️ Paramètres</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ fontSize: 13, color: '#e74c3c' }}>
                🚪 Déconnexion
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* ── Contenu de la page ──────────────────────────────── */}
        <Box sx={{ flex: 1, overflow: 'auto', background: '#f0f2f5' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

const iconBtnSx = {
  background: '#f5f7fa',
  border: '1px solid #e0e4ea',
  borderRadius: 2,
  width: 36,
  height: 36,
  color: '#555',
};