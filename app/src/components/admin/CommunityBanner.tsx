import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";
import { setBooleanMemory, getBooleanMemory } from "@/utils/memory.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";

const DISCORD_LINK = "https://discord.gg/tw9N8GChKp";

function CommunityBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  
  useEffect(() => {
    const isBannerClosed = getBooleanMemory("community_banner_closed", false);
    if (isBannerClosed) {
      setVisible(false);
    }
  }, []);

  const handleClose = () => {
    setShowConfirm(true);
  };

  const confirmClose = () => {
    setBooleanMemory("community_banner_closed", true);
    setVisible(false);
    setShowConfirm(false);
  };

  const handleDiscordClick = () => {
    window.open(DISCORD_LINK, "_blank");
  };

  if (!visible) return null;

  return (
    <>
      <div className="community-banner-container">
        <div className="community-banner">
          <div className="banner-content">
            <div className="banner-message">
              <h3 className="text-lg font-semibold">{t("admin.join-community")}</h3>
              <p className="text-sm text-muted-foreground">{t("admin.community-description")}</p>
            </div>
            <div className="banner-actions">
              <Button 
                variant="default" 
                className="discord-link"
                onClick={handleDiscordClick}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {t("admin.community-join-button")}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose} className="close-button">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.community-confirm-close")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.community-banner-confirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscordClick}>
              {t("admin.community-stay")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose}>
              {t("admin.community-close")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default CommunityBanner;
