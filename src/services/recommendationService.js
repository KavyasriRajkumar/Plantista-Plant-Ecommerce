import api from './api';

// Uses the shared API client (base URL + auth token). All scoring happens on
// the server; the client only sends preferences.
export const getPlantRecommendations = async (preferences) => {
  const { data } = await api.post('/recommendations/plants', preferences);
  return data;
};
