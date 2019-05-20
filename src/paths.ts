import { homedir } from "os";
import path from "path";

export const home = path.join(homedir(), ".glide");
export const creds = path.join(home, "credentials.json");
