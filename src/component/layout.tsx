"use client";
import React, { useState } from "react";
import {
  styled,
  useTheme,
  Theme,
  CSSObject,
  PaletteMode,
} from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import * as Icons from "@mui/icons-material";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useRouter } from "next/router";
import { AuthService } from "@/services/auth";
import { User } from "firebase/auth";

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

interface LayoutProps {
  user: User | null;
  children: React.ReactNode;
  setTheme: React.Dispatch<React.SetStateAction<PaletteMode | undefined>>;
  currentTheme: PaletteMode | undefined;
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

export default function Layout({
  user,
  children,
  setTheme,
  currentTheme,
}: LayoutProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      router.replace("/signin");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  const routes = [
    {
      title: "Início",
      path: "/dashboard",
      icon: <Icons.Home />,
    },
    {
      title: "Configurações",
      path: "/settings",
      icon: <Icons.Settings />,
    },
    {
      title: "Notícias",
      path: "/newsletters",
      icon: <Icons.Newspaper />,
    },
    {
      title: "Documentos",
      path: "/files",
      icon: <Icons.UploadFile />,
    },
    {
      title: "Sair",
      path: null,
      trigger: () => handleSignOut(),
      icon: <Icons.ExitToApp />,
    },
  ];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                marginRight: 5,
              },
              open && { display: "none" },
            ]}
          >
            <Icons.Menu />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Typography variant="h6" noWrap component="div">
              Dashboard
            </Typography>
            <IconButton color="inherit" onClick={handleDrawerOpen}>
              {currentTheme === "light" ? (
                <Icons.DarkMode onClick={() => setTheme("dark")} />
              ) : (
                <Icons.LightMode onClick={() => setTheme("light")} />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <Icons.ChevronRight />
            ) : (
              <Icons.ChevronLeft />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {routes.map((item) => (
            <ListItem
              key={item.title}
              disablePadding
              sx={{ display: "block" }}
              onClick={() =>
                item.path ? router.push(item.path) : item.trigger!()
              }
            >
              <ListItemButton
                sx={[
                  { minHeight: 48, px: 2.5 },
                  { justifyContent: open ? "initial" : "center" },
                ]}
              >
                <ListItemIcon
                  sx={[
                    { minWidth: 0, justifyContent: "center" },
                    { mr: open ? 3 : "auto" },
                  ]}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={[{ opacity: open ? 1 : 0 }]}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
