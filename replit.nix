{pkgs}: {
  deps = [
    pkgs.chromium
    pkgs.mesa
    pkgs.xorg.libxcb
    pkgs.expat
    pkgs.libdrm
    pkgs.alsa-lib
    pkgs.glib
    pkgs.cairo
    pkgs.pango
    pkgs.libxkbcommon
    pkgs.xorg.libXrandr
    pkgs.xorg.libXfixes
    pkgs.xorg.libXdamage
    pkgs.xorg.libXcomposite
    pkgs.cups
    pkgs.atk
    pkgs.dbus
    pkgs.nspr
    pkgs.nss
  ];
}
