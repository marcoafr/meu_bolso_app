import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  Avatar,
} from "@mui/material";
import {
  MenuRounded,
  LogoutRounded,
  SpaceDashboardRounded,
  ReceiptLongRounded,
  SwapHorizRounded,
  CategoryRounded,
  SavingsRounded,
  AccountBalanceWalletRounded,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../authenticationContext";
import logonotext from "../images/logonotext.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogoClick = () => {
    navigate("/home");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const toggleDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  const navigationLinks = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <SpaceDashboardRounded fontSize="small" />,
    },
    {
      label: "Registrar transação",
      path: "/registerTransaction",
      icon: <ReceiptLongRounded fontSize="small" />,
    },
    {
      label: "Transações",
      path: "/transactions",
      icon: <SwapHorizRounded fontSize="small" />,
    },
    {
      label: "Categorias",
      path: "/categories",
      icon: <CategoryRounded fontSize="small" />,
    },
    {
      label: "Orçamentos",
      path: "/budgets",
      icon: <SavingsRounded fontSize="small" />,
    },
    {
      label: "Bancos e cartões",
      path: "/banksAndCards",
      icon: <AccountBalanceWalletRounded fontSize="small" />,
    },
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          color: "#0f172a",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 72, md: 80 },
            px: { xs: 2, md: 4 },
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ cursor: "pointer", minWidth: 0 }}
            onClick={handleLogoClick}
          >
            <Box
              component="img"
              src={logonotext}
              alt="Meu Bolso"
              sx={{
                width: 42,
                height: 42,
                objectFit: "contain",
                borderRadius: "12px",
                flexShrink: 0,
              }}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.1,
                }}
              >
                Meu Bolso
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.82rem",
                  color: "#64748b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: { xs: 140, sm: 220 },
                }}
              >
                Olá, {user?.name || "Usuário"}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: { xs: "none", lg: "flex" },
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {navigationLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <Button
                  key={link.path}
                  onClick={() => handleNavigation(link.path)}
                  startIcon={link.icon}
                  sx={{
                    px: 2,
                    py: 1.1,
                    borderRadius: "999px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: isActive ? "primary.main" : "#334155",
                    backgroundColor: isActive
                      ? "rgba(25, 118, 210, 0.10)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isActive
                        ? "rgba(25, 118, 210, 0.14)"
                        : "rgba(148, 163, 184, 0.12)",
                    },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}

            <Button
              onClick={handleLogout}
              startIcon={<LogoutRounded fontSize="small" />}
              sx={{
                ml: 1,
                px: 2.2,
                py: 1.1,
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "#b42318",
                backgroundColor: "rgba(180, 35, 24, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(180, 35, 24, 0.14)",
                },
              }}
            >
              Sair
            </Button>
          </Box>

          <IconButton
            onClick={toggleDrawer}
            sx={{
              display: { xs: "inline-flex", lg: "none" },
              width: 44,
              height: 44,
              borderRadius: "12px",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              color: "#0f172a",
            }}
          >
            <MenuRounded />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: { xs: "84%", sm: 360 },
            p: 2,
            backgroundColor: "#ffffff",
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3, mt: 1 }}>
          <Avatar
            src={logonotext}
            alt="Meu Bolso"
            sx={{
              width: 44,
              height: 44,
              bgcolor: "#e2e8f0",
            }}
          />
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
              Meu Bolso
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", color: "#64748b" }}>
              Olá, {user?.name || "Usuário"}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <List sx={{ p: 0 }}>
          {navigationLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <ListItemButton
                key={link.path}
                onClick={() => handleNavigation(link.path)}
                sx={{
                  mb: 1,
                  borderRadius: "16px",
                  py: 1.2,
                  px: 1.5,
                  backgroundColor: isActive
                    ? "rgba(25, 118, 210, 0.10)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(148, 163, 184, 0.10)",
                  },
                }}
              >
                <Box
                  sx={{
                    mr: 1.5,
                    display: "flex",
                    alignItems: "center",
                    color: isActive ? "primary.main" : "#475569",
                  }}
                >
                  {link.icon}
                </Box>

                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? "primary.main" : "#0f172a",
                  }}
                />
              </ListItemButton>
            );
          })}

          <Divider sx={{ my: 2 }} />

          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "16px",
              py: 1.2,
              px: 1.5,
              backgroundColor: "rgba(180, 35, 24, 0.06)",
              "&:hover": {
                backgroundColor: "rgba(180, 35, 24, 0.12)",
              },
            }}
          >
            <Box
              sx={{
                mr: 1.5,
                display: "flex",
                alignItems: "center",
                color: "#b42318",
              }}
            >
              <LogoutRounded fontSize="small" />
            </Box>

            <ListItemText
              primary="Sair"
              primaryTypographyProps={{
                fontWeight: 700,
                color: "#b42318",
              }}
            />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;