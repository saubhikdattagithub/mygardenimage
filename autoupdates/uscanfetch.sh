#!/usr/bin/bash

#VER='20250123.00'
NOW=$(date +%Y%m%d%H%M)

PKGNAME=$1
REPONAME='package-'$PKGNAME
DIR=$PKGNAME-$NOW
HOME=/root/GARDENLINUX001/mygardenimage/autoupdates

mkdir /tmp/work
mkdir -p /tmp/work/$DIR/debian
cd /tmp/work/$DIR
echo "Changing to Directory :" /tmp/work/$DIR

echo "Package Name determined: " $REPONAME
REPOURL="https://github.com/gardenlinux/${REPONAME}"
git clone $REPOURL
cd $REPONAME
echo "Changing to Directory :" $REPONAME

GETVER=$(grep version= prepare_source | cut -d'=' -f2 | cut -d'"' -f2)
GETVER_ORIG=$(grep version_orig= prepare_source | cut -d'=' -f2 | cut -d'"' -f2)
echo "GetVersion: " $GETVER
echo "GetVersion_Orig: " $GETVER_ORIG
#if [[ -n  "$GETVER" ]] && [[ "$GETVER" =~ ^[0-9]+$ ]]; then
#	VER="$GETVER"
#elif [[ -n "$GETVER_ORIG" ]] && [[ "$GETVER_ORIG" =~ ^[0-9]+$ ]]; then
#	VER="$GETVER_ORIG"
#fi


if [[ -n "${GETVER}" ]] && [[ "${GETVER}" =~ [0-9]+$ ]]; then
    VER="${GETVER}"
elif [[ -n "${GETVER_ORIG}" ]]  && [[ "${GETVER_ORIG}" =~ [0-9]+$ ]]; then
    VER="${GETVER_ORIG}"
fi

echo "Version determined : " $VER
echo "$PKGNAME (${VER}) unstable; urgency=medium" > /tmp/work/$DIR/debian/changelog
#cp $HOME/watch_$PKGNAME /tmp/work/$DIR/debian/watch
uscan --verbose --report --watch $HOME/watch_$PKGNAME
#rm -rf /tmp/work/$DIR
