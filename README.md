# Google Images Reverse Search Downloader

This is a simple script to download images from [Google Images Reverse Search](https://images.google.com/).

Then, it uses [MaxUrl](https://github.com/qsniyg/maxurl/) to get the upscaled version of the image, if available.

### Usage

```
npm i -g pnpm
pnpm install
pnpm start -i /tmp/Mickey.png -o MickeyHD.png
```

# Note

Only French is supported for now, but feel free to add your own language in the main script (pull request), but it should still work anyway.

It can happen that Google is a bit capricious, so do not hesitate to restart the script. If the waiting period is exceeded, it is very likely that no image has been found.

----

**FROM**

![Mickey](./images/Mickey.png)

**TO**

![Mickey](./images/MickeyHD.png)
