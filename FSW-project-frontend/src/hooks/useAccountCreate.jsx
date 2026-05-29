import { useState } from "react";
import { toast } from "react-toastify";
import authService from "../services/authService";

/**
 * useAccountCreate — shared hook for creating a login account
 * after a student or teacher profile is created on the mock API.
 *
 * Returns { createAccount } where createAccount({ email, firstName, lastName, role, profileId })
 * shows appropriate toast on success or failure.
 */
const useAccountCreate = () => {
  const [creating, setCreating] = useState(false);

  const createAccount = async ({ email, firstName, lastName, role, profileId }) => {
    const defaultPassword = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const name            = `${firstName} ${lastName}`;
    setCreating(true);
    try {
      await authService.createAccount({
        email,
        plainPassword: defaultPassword,
        role,
        name,
        linkedProfileId: profileId,
      });
      toast.success(
        <div>
          <strong>
            {role === "student" ? "Student" : "Teacher"} profile created and login account generated.
          </strong>
          <br />Login email: <code>{email}</code>
          <br />Default password: <code>{defaultPassword}</code>
        </div>,
        { autoClose: 8000 }
      );
    } catch (accErr) {
      toast.warning(
        <div>
          <strong>Profile created, but login account creation failed.</strong>
          <br />{accErr.message}
          <br />{role === "student" ? "Student" : "Teacher"} cannot log in until this is resolved.
        </div>,
        { autoClose: 10000 }
      );
    } finally {
      setCreating(false);
    }
  };

  return { createAccount, creating };
};

export default useAccountCreate;
