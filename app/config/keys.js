const keys = async () => {
  // Check environment to determine which set of credentials to return
  if (process.env.NODE_ENV === 'production') {
    // Import production keys
    return import('./prod.js');
  } else {
    // Import development keys
    return import('./dev.js');
  }
};

// Wrap the logic inside an async function for exporting
export default keys;
