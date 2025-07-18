import axiosInstance from "@/lib/axiosInstance";
import { Patient, Video } from "@/types/types"; // We will define this type in the next step

/**
 * Fetches a list of all patients, with their associated videos, from the API.
 * @returns Promise resolving to an array of Patient objects.
 */
export async function getAllPatients(): Promise<Patient[]> {
    try {
        const url = `/patients/`;
        console.log(`[getAllPatients] Requesting: ${axiosInstance.defaults.baseURL}${url}`);
        const response = await axiosInstance.get<Patient[]>(url);
        console.log(`[getAllPatients] Received ${response.data.length} patients.`);
        return response.data;
    } catch (error: any) {
        console.error('[getAllPatients] Error fetching patient list:', error);
        // Propagate the error to be handled by the component
        throw error;
    }
}

/**
 * Creates a new patient.
 * @param name The name of the new patient.
 * @returns Promise resolving to the newly created Patient object.
 */
export async function createPatient(researchID: string): Promise<Patient> {
    try {
        const url = `/patient/?researchID=${encodeURIComponent(researchID)}`;
        console.log(`[createPatient] Requesting POST to: ${axiosInstance.defaults.baseURL}${url}`);
        const response = await axiosInstance.post<Patient>(url);
        console.log(`[createPatient] Successfully created patient:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error('[createPatient] Error creating patient:', error);
        throw error;
    }
}

/**
 * Fetches a list of all videos for a specific patient.
 * @param patientId The ID of the patient.
 * @param skip Number of items to skip for pagination.
 * @param limit Maximum number of items to return.
 * @returns Promise resolving to an array of Video objects.
 */
export async function getVideosForPatient(
    patientId: string,
    skip: number = 0,
    limit: number = 100
): Promise<Video[]> {
    try {
        const url = `/patient/${patientId}/videos/?skip=${skip}&limit=${limit}`;
        console.log(`[getVideosForPatient] Requesting: ${axiosInstance.defaults.baseURL}${url}`);
        const response = await axiosInstance.get<Video[]>(url);
        return response.data;
    } catch (error: any) {
        console.error(`[getVideosForPatient] Error fetching videos for patient ${patientId}:`, error);
        throw error;
    }
}

/**
 * Fetches a single patient by their ID, including their video list.
 * @param patientId The ID of the patient to fetch.
 * @returns Promise resolving to a single Patient object.
 * @throws An error if the API call fails.
 */
export async function getPatientById(patientId: string): Promise<Patient> {
    try {
        const url = `/patient/${patientId}`;
        console.log(`[getPatientById] Requesting: ${axiosInstance.defaults.baseURL}${url}`);
        const response = await axiosInstance.get<Patient>(url);
        console.log(`[getPatientById] Received data for patient ${patientId}.`);
        return response.data;
    } catch (error: any) {
        console.error(`[getPatientById] Error fetching patient ${patientId}:`, error);
        if (error.response) {
            console.error('[getPatientById] Response data:', error.response.data);
        }
        throw error;
    }
}

/**
 * Deletes a patient by their ID.
 * @param patientId The ID of the patient to delete.
 * @returns Promise resolving with the API's response on successful deletion.
 */
export async function deletePatient(patientId: number): Promise<any> {
    try {
        const url = `/patient/${patientId}`;
        console.log(`[deletePatient] Requesting DELETE to: ${axiosInstance.defaults.baseURL}${url}`);
        const response = await axiosInstance.delete(url);
        console.log(`[deletePatient] Successfully deleted patient ${patientId}.`);
        return response.data;
    } catch (error: any) {
        console.error(`[deletePatient] Error deleting patient ${patientId}:`, error);
        throw error; // Propagate error to be handled by the server action
    }
}