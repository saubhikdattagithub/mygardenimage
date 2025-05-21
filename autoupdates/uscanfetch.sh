#!/usr/bin/bash

#VER='20250123.00'
NOW=$(date +%Y%m%d%H%M)

PKGNAME=$1
REPONAME='package-'$PKGNAME
DIR=$PKGNAME-$NOW
HOME=/root/GARDENLINUX001/mygardenimage/autoupdates
PRPSRC='prepare_source'

mkdir -p /tmp/work/$DIR/debian
cd /tmp/work/$DIR
CAP_USCAN='capture_uscan'
touch $CAP_USCAN
echo "##Changing to Directory :" /tmp/work/$DIR

echo "##Package Name determined: " $REPONAME
REPOURL="https://github.com/gardenlinux/${REPONAME}"
git clone $REPOURL
cd $REPONAME
echo "##Changing to Directory :" $REPONAME
echo ----
GETVER=$(grep version= $PRPSRC | cut -d'=' -f2 | cut -d'"' -f2 )
GETVER_ORIG=$(grep version_orig= $PRPSRC | cut -d'=' -f2 | cut -d'"' -f2 )
if [[ "$1" =~ "python" ]]; then 
	GITBRVER=$(grep git_src $PRPSRC | grep github | awk '{print $3}' | sed 's#.*/##; s/^v//')
else
	GITBRVER=$(grep git_src $PRPSRC | awk '{print $3}' | sed 's#.*/##; s/^v//')
fi
	
echo "GetVersion: " $GETVER
echo "GetVersion_Orig: " $GETVER_ORIG
echo "GitBranchVersion: " $GITBRVER

if [[ -n "${GETVER}" && "${GETVER}" =~ [0-9]+$ ]]; then
    VER="${GETVER}"
elif [[ -n "${GETVER_ORIG}" && "${GETVER_ORIG}" =~ [0-9]+$ ]]; then
    VER="${GETVER_ORIG}"
elif [[ -n "${GITBRVER}" && "${GITBRVER}" =~ [0-9]+$ ]]; then
    VER="${GITBRVER}"
fi

echo "##Version determined : " $VER
echo ----
echo "$PKGNAME (${VER}) unstable; urgency=medium" > /tmp/work/$DIR/debian/changelog
uscan --report --watch $HOME/watch_$PKGNAME | tee $CAP_USCAN 
NEWVER=$(grep "Newest version" $CAP_USCAN | cut -d',' -f1 | rev | cut -d' ' -f1 | rev)
echo ----
echo "##New Version determined: " $NEWVER
if [[ "${NEWVER}" =~ [0-9]+$  ]]; then
	sed -i "s|${VER}|${NEWVER}|g" $PRPSRC
	echo ==========================================================
	echo "prepare_source : "
	echo '##############'
	cat $PRPSRC
	echo ==========================================================
else
	echo ----
	echo "IMPORTANT: Could not retrieve the Newer Version information using uscan for this package"
	exit 3
fi

#rm -rf /tmp/work/$DIR
:>$CAP_USCAN
