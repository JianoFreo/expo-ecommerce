import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { setAxiosTokenGetter } from "@/lib/axios";

export default function AuthTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAxiosTokenGetter(() => getToken());
    return () => setAxiosTokenGetter(null);
  }, [getToken]);

  return null;
}
