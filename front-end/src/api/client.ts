import axios from "axios"

const apiUrl = import.meta.env.VITE_API_URL

export async function uploadFile(file: File, sentence: string, language: string){

    const formData = new FormData();
    formData.append("file", file)
    formData.append("sentence", sentence)
    formData.append("language", language)

    const response = await axios.post(`${apiUrl}/upload/`, formData)
    .catch((error)=>{
        if (axios.isAxiosError(error)) {
            console.error("Error fetching data", error.message ?? error.response?.data)
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
        }
        return null
    })

    return response
}


export async function getStatus(job_id: string){
    
    const response = await axios.get(`${apiUrl}/status/${job_id}`, {
        headers: {"Content-Type": "application/json"}
    })
    .catch((error)=>{
        if(axios.isAxiosError(error)){
            console.error("Error fetching data: ", error.message ?? error.response.data)
        }
        else{
            console.log("Unexpected Error", error)
        }

        return null
    })

    return response
}

export async function getResult(job_id: string) {
    
    const response = await axios.get(`${apiUrl}/result/${job_id}`, {responseType: "blob"})
    .catch(
        (error)=>{
            if (axios.isAxiosError(error)) {
                console.log("error fetching result: ", error.message ?? error.response.data)
            }
            else{
                console.log("Unexpected error: ", error)
            }
        }
    )

    return response ? response.data: null;
}