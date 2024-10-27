const GITHUB_USER = 'qinxiaoguang'; // Replace with your GitHub username

export const checkAuth = () => {
  const token = localStorage.getItem('blog_token');
  return token === GITHUB_USER;
};

export const login = async (username: string) => {
  if (username.toLowerCase() === GITHUB_USER.toLowerCase()) {
    localStorage.setItem('blog_token', username);
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem('blog_token');
};