import { createServiceLogger } from "../middlewares/serviceLogger";
import { ShareService as OriginalShareService } from "./shareService";

// Apply logging middleware to the services
export const ShareService = createServiceLogger(OriginalShareService);
