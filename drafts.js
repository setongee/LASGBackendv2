import axios from "axios";
import { env } from "../../../../api/read/environment";
import { notify } from "../../../../utils/toast";
import { authenticateToken } from "../auth/auth";
import { addLoggingData } from "../logger/logger";

const base_url = `${env}`;

const auth = JSON.parse(window.localStorage.getItem("MDA__TOKEN"));
const page = window.location.pathname.split("/")[3];

export const createDraft = async (data) => {
  if (!auth || !auth.token) {
    notify.error("You are not authorized to access this page");
    window.location.href = `/${page}/admin/${page}`;
    return;
  }

  const authResponse = await authenticateToken(auth.token, data.mda);

  if (authResponse.status === "bad") {
    notify.error(authResponse.message);
    window.location.href = `/${data.mda}/admin/${page}`;
    return authResponse;
  }

  try {
    const response = await axios.post(`${base_url}/draft/create`, data);

    if (response.status === 200) {
      notify.success(response.data.message);
      addLoggingData({
        initiator: auth?.firstname + " " + auth?.lastname,
        mda: data.mda,
        activity: `${auth?.firstname + " " + auth?.lastname} created a draft`,
      });
      return response.data;
    } else {
      notify.error(response.data.message);
      return null;
    }
  } catch (error) {
    notify.error("Failed to create draft");
    return null;
  }
};

export const getAllDrafts = async () => {
  if (!auth || !auth.token) {
    notify.error("You are not authorized to access this page");
    window.location.href = `/${page}/admin/${page}`;
    return;
  }

  const authResponse = await authenticateToken(auth.token);

  if (authResponse.status === "bad") {
    notify.error(authResponse.message);
    window.location.href = `/${page}/admin/${page}`;
    return authResponse;
  }

  try {
    const response = await axios.get(`${base_url}/draft/get/all`);

    if (response.status === 200) {
      return response.data.data;
    } else {
      notify.error(response.data.message);
      return null;
    }
  } catch (error) {
    notify.error("Failed to fetch drafts");
    return null;
  }
};

export const getDraftsByMda = async (mda) => {
  if (!auth || !auth.token) {
    notify.error("You are not authorized to access this page");
    window.location.href = `/${page}/admin/${page}`;
    return;
  }

  const authResponse = await authenticateToken(auth.token, mda);

  if (authResponse.status === "bad") {
    notify.error(authResponse.message);
    window.location.href = `/${mda}/admin/${page}`;
    return authResponse;
  }

  try {
    const response = await axios.get(`${base_url}/draft/get/mda/${mda}`);

    if (response.status === 200) {
      return response.data.data;
    } else {
      notify.error(response.data.message);
      return null;
    }
  } catch (error) {
    notify.error("Failed to fetch drafts for MDA");
    return null;
  }
};

export const getSingleDraft = async (id) => {
  if (!auth || !auth.token) {
    notify.error("You are not authorized to access this page");
    window.location.href = `/${page}/admin/${page}`;
    return;
  }

  const authResponse = await authenticateToken(auth.token);

  if (authResponse.status === "bad") {
    notify.error(authResponse.message);
    window.location.href = `/${page}/admin/${page}`;
    return authResponse;
  }

  try {
    const response = await axios.get(`${base_url}/draft/view/${id}`);

    if (response.status === 200) {
      return response.data.data;
    } else {
      notify.error(response.data.message);
      return null;
    }
  } catch (error) {
    notify.error("Failed to fetch draft");
    return null;
  }
};

export const updateDraft = async (id, data) => {
  if (!auth || !auth.token) {
    notify.error("You are not authorized to access this page");
    window.location.href = `/${page}/admin/${page}`;
    return;
  }

  const authResponse = await authenticateToken(auth.token, data.mda);

  if (authResponse.status === "bad") {
    notify.error(authResponse.message);
    window.location.href = `/${data.mda}/admin/${page}`;
    return authResponse;
  }

  try {
    const response = await axios.put(`${base_url}/draft/update/${id}`, data);

    if (response.status === 200) {
      notify.success(response.data.message);
      addLoggingData({
        initiator: auth?.firstname + " " + auth?.lastname,
        mda: data.mda,
        activity: `${auth?.firstname + " " + auth?.lastname} updated a draft`,
      });
      return response.data;
    } else {
      notify.error(response.data.message);
      return null;
    }
  } catch (error) {
    notify.error("Failed to update draft");
    return null;
  }
};

export const deleteDraft = async (id, mda) => {
  if (!auth || !auth.token) {
    notify.error("You are not authorized to access this page");
    window.location.href = `/${page}/admin/${page}`;
    return;
  }

  const authResponse = await authenticateToken(auth.token, mda);

  if (authResponse.status === "bad") {
    notify.error(authResponse.message);
    window.location.href = `/${mda}/admin/${page}`;
    return authResponse;
  }

  try {
    const response = await axios.delete(`${base_url}/draft/delete/${id}`);

    if (response.status === 200) {
      notify.success(response.data.message);
      addLoggingData({
        initiator: auth?.firstname + " " + auth?.lastname,
        mda: mda,
        activity: `${auth?.firstname + " " + auth?.lastname} deleted a draft`,
      });
      return response.data;
    } else {
      notify.error(response.data.message);
      return null;
    }
  } catch (error) {
    notify.error("Failed to delete draft");
    return null;
  }
};
