export const fetchData = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_JSONBIN_API_ENDPOINT}`,
      {
        method: 'GET',
        headers: {
          'X-Access-Key': process.env.NEXT_PUBLIC_APP_JSONBIN_ACCESS_KEY as string,
        },
      }
    );

    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw new Error('Resource not found');
        case 500:
          throw new Error('Server error');
        default:
          throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    return data.record;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
