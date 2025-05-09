import express from "express";
import { 
  addNewAdmin, 
  addNewDoctor, 
  getAllDoctors, 
  getPatientDetails, 
  getUserDetails, // Add missing import
  login, 
  logoutAdmin, 
  logoutPatient, 
  patientRegister,
  updateUserProfile
} from "../controller/userController.js";
import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// ➡️ Fix 1: Use consistent 'router' variable
router.post("/register", patientRegister);
router.post("/login", login);
// router.post("/admin/add", isAdminAuthenticated, addNewAdmin);
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
// router.get("/doctors", getAllDoctors);
router.get("/me", isPatientAuthenticated, getUserDetails); // Add middleware
// router.get("/logout/admin", logoutAdmin);
// router.get("/logout/patient", logoutPatient);
// userRouter.js (doctor routes section)
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor); // ✅ Matches frontend
router.get("/doctors", getAllDoctors);
router.get("/admin/logout", logoutAdmin);
router.get("/patient/logout", logoutPatient);
// router.post("/doctor/add", isAdminAuthenticated, addNewDoctor);
// Add this route
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
// Ensure proper middleware order
// router.post("/login", login);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);

// ➡️ Fix 2: Proper patient routes
router.route("/patient/me")
  .get(isPatientAuthenticated, getPatientDetails);

router.route("/patient/update")
  .put(isPatientAuthenticated, updateUserProfile);

export default router;