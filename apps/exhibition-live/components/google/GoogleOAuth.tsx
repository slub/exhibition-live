import {
  TokenResponse,
  useGoogleLogin,
  useGoogleOneTapLogin,
} from "@react-oauth/google";
import { Button } from "@mui/material";
import { FC, useCallback, useEffect } from "react";
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
  return credentials?.access_token ? (
    <>
      <Button onClick={() => logout()}>Log out</Button>
      You have access to the users drive
    </>
  ) : (
    <Button onClick={() => login()}>Sign in with Google 🚀</Button>
  );
};
