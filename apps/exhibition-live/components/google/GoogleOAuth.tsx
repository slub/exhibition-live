import {
  hasGrantedAnyScopeGoogle,
  TokenResponse,
  useGoogleLogin,
  useGoogleOneTapLogin,
} from "@react-oauth/google";
import { Button } from "@mui/material";
import { FC, useCallback, useEffect, useMemo } from "react";
import { useGoogleToken } from "./useGoogleToken";

type LoginProps = {
  scopes: string[];
};
export const Login: FC<LoginProps> = ({ scopes }) => {
  const { init, setCredentials, credentials, clear } = useGoogleToken();
  useEffect(() => {
    init();
  }, [init]);

  useGoogleOneTapLogin({
    onSuccess: (credentialResponse) => {
      console.log(credentialResponse);
    },
    onError: () => {
      console.log("Login Failed");
    },
    auto_select: true,
  });
  const login = useGoogleLogin({
    scope: scopes.join(" "),
    onSuccess: (
      credentialResponse: Omit<
        TokenResponse,
        "error" | "error_description" | "error_uri"
      >,
    ) => {
      setCredentials(credentialResponse);
    },
    onError: () => {
      console.error("Login Failed");
    },
  });

  const granted = useMemo(
    () =>
      typeof window !== "undefined" &&
      hasGrantedAnyScopeGoogle(
        credentials,
        ...(scopes as [string, string, string]),
      ),
    [credentials, scopes],
  );
  useEffect(() => {
    console.log({ credentials });
    if (credentials?.access_token) {
      //console.log("logged in");
      //login();
    }
  }, [credentials, login]);

  const logout = useCallback(() => {
    clear();
  }, [clear]);
  return credentials?.access_token && granted ? (
    <>
      <Button onClick={() => logout()}>Log out</Button>
      You have access to the users drive
    </>
  ) : (
    <Button onClick={() => login()}>Sign in with Google 🚀</Button>
  );
};
