import "@/assets/pages/navbar.less";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAuthenticated,
  selectUsername,
  validateToken,
} from "@/store/auth.ts";
import { Button } from "@/components/ui/button.tsx";
import { Menu } from "lucide-react";
import {useState, useEffect } from "react";
import { tokenField } from "@/conf/bootstrap.ts";
import { toggleMenu } from "@/store/menu.ts";
import ProjectLink from "@/components/ProjectLink.tsx";
import ModeToggle from "@/components/ThemeProvider.tsx";
import router from "@/router.tsx";
import MenuBar from "./MenuBar.tsx";
import { getMemory } from "@/utils/memory.ts";
import { goAuth } from "@/utils/app.ts";
import Avatar from "@/components/Avatar.tsx";
import { appLogo } from "@/conf/env.ts";
import Announcement from "@/components/app/Announcement.tsx";


import { getInviteCode } from "@/api/invite.ts"; // 邀请码API
import { copyClipboard } from "@/utils/dom.ts"; // 引入复制到剪贴板工具函数

function NavMenu() {
  const username = useSelector(selectUsername);

  return (
    <div className={`avatar`}>
      <MenuBar>
        <Button variant={`ghost`} size={`icon`}>
          <Avatar username={username} />
        </Button>
      </MenuBar>
    </div>
  );
}



function InviteCodeSection({ username }: { username: string }){
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  // 获取邀请码
  useEffect(() => {
    if (username) {
      setLoading(true);
      getInviteCode(username)
        .then((code) => {
          setInviteCode(code);
        })
        .finally(() => setLoading(false));
    }
  }, [username]);



  // 生成包含邀请码的链接
  const generateInviteLink = () => {
    const baseURL = window.location.origin;  // 获取当前页面的 baseURL
    return `${baseURL}/register/?invitationCode=${inviteCode}`;
  };




  // 复制邀请码到剪贴板
  const handleCopyInviteCode = async () => {
  const inviteCode = generateInviteLink();
    if (inviteCode) {
      try {
        await copyClipboard(inviteCode);
        alert("复制邀请码到剪贴板");
      } catch (e) {
        console.warn("Failed to copy invite code:", e);
      }
    }
  };

  if (loading) return <div>'加载中...'</div>;
 
 
  return (
    <div className={`invite-section`}>
    
      {inviteCode ? (
        <Button size="sm" onClick={handleCopyInviteCode}>
          {inviteCode}
        </Button>
      ) : (
         <p>未找到邀请码</p>
      )}
    </div>
  );
}




function NavBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useEffect(() => {
    validateToken(dispatch, getMemory(tokenField));
  }, []);
  const auth = useSelector(selectAuthenticated);
  const username = useSelector(selectUsername);


  return (
    <nav className={`navbar`}>
      <div className={`items`}>
        <Button
          size={`icon`}
          variant={`ghost`}
          onClick={() => dispatch(toggleMenu())}
        >
          <Menu />
        </Button>
        <img
          className={`logo`}
          src={appLogo}
          alt=""
          onClick={() => router.navigate("/")}
        />
        <div className={`grow`} />
        <p>点击复制邀请码：</p>
<InviteCodeSection username={username} /> {/* 显示邀请码部分 */}
        
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Announcement />
        <ModeToggle />
        {auth ? (
          <NavMenu />
        ) : (
          <Button size={`sm`} onClick={goAuth}>
            {t("login")}
          </Button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
