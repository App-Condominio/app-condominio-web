"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { setCookie, destroyCookie } from "nookies";
import { auth } from "@/config/firebaseClient";

export function useAuthListener() {
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged", user);
      if (user) {
        const token = await user.getIdToken();
        setCookie(null, "authToken", token, {
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
        });
        setAuthUser(user);
      } else {
        destroyCookie(null, "authToken");
        setAuthUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return authUser;
}
