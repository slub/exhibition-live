import {
  hasGrantedAnyScopeGoogle,
  TokenResponse,
  useGoogleLogin,
} from "@react-oauth/google";
import { Button } from "@mui/material";
import { useCallback } from "react";
import { useGoogleToken } from "./useGoogleToken";
import { GoogleDrivePicker, GoogleDrivePickerModal } from "./GoogleDrivePicker";
import NiceModal from "@ebay/nice-modal-react";

const scopes: [string, string] = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
];
export const Login = () => {
  const { setCredentials, credentials } = useGoogleToken();
  const login = useGoogleLogin({
    scope: scopes.join(" "),
    onSuccess: (
      credentialResponse: Omit<
        TokenResponse,
        "error" | "error_description" | "error_uri"
      >,
    ) => {
      console.log(credentialResponse);
      setCredentials(credentialResponse);
    },
    onError: () => {
      console.log("Login Failed");
    },
  });
  const openDrivePicker = useCallback(() => {
    NiceModal.show(GoogleDrivePickerModal, {});
  }, []);
  const hasAccess =
    credentials && hasGrantedAnyScopeGoogle(credentials, ...scopes);
  return hasAccess ? (
    <>
      You have access to the users drive
      <Button onClick={openDrivePicker}>choose file</Button>
    </>
  ) : (
    <Button onClick={() => login()}>Sign in with Google 🚀</Button>
  );
};
