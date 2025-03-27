import { useThemeContext } from "../hooks/useTheme";

const Footer = () => {
  const { systemTheme } = useThemeContext();

  return (
    <footer
      className="mt-auto py-4 text-center"
      style={{ color: systemTheme.text.secondary }}
    >
      <p>© 2024 Typing Game. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
