import { createServiceLogger } from "../middlewares/serviceLogger";
import { SavedService as OriginalSavedService } from "./savedService";
import { ShareService as OriginalShareService } from "./shareService";

// Apply logging middleware to the services
export const ShareService = createServiceLogger(OriginalShareService);
export const SavedService = createServiceLogger(OriginalSavedService);
