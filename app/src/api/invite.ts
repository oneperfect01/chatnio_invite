import axios from 'axios';


export async function getInviteCode(username: string): Promise<string | null> {
  try {
    const response = await axios.get('/getcode', {
      params: { username },
    });

    if (response.data.status) {
      return response.data.invitationCode;  
    } else {
      console.error('Error:', response.data.error);
      return null;  
    }
  } catch (error) {
    console.error('An error occurred:', error);
    return null;  
  }
}
