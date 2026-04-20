const API_URL = 'http://localhost:8080/api';

export async function getProfile(token) {
  const response = await fetch(`${API_URL}/user/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Erro ao buscar perfil');
  return response.json();
}

export async function updateProfile(token, data) {
  const response = await fetch(`${API_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao atualizar perfil');
  }
  return response.json();
}