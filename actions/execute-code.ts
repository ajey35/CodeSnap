import axios from "axios";

export async function ExecuteCode(requestPayload: any) {
    const apiEndpoint = "https://emkc.org/api/v2/piston/execute";

    try {
        const { data } = await axios.post(apiEndpoint, requestPayload);

        return data;
    } catch (error) {
        return error;
    }
}
