import axios from 'axios';

// 根据用户名获取邀请码
export async function getInviteCode(username: string): Promise<string | null> {
  try {
    const response = await axios.get('/getcode', {
      params: { username },
    });

    if (response.data.status) {
      return response.data.invitationCode;  // 返回服务器的邀请码
    } else {
      console.error('Error:', response.data.error);
      return null;  // 未找到用户或邀请码
    }
  } catch (error) {
    console.error('An error occurred:', error);
    return null;  // 请求失败或发生其他错误
  }
}
