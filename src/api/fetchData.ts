export const fetchData = async () => {
  const response = await fetch(
    `${process.env.REACT_APP_JSONBIN_API_ENDPOINT}`,
    {
      method: 'GET',
      headers: {
        'X-Access-Key': `${process.env.REACT_APP_JSONBIN_ACCESS_KEY}`,
      },
    }
  );
  console.log(response);
  const data = await response.json();
  return data.record;
};
