function Album(){};
Album.prototype = {
    setProps: function(id, guid, name, datecreated, productid, pagewidth, pageheight, pagebleed, usecover, coverwidth, coverheight, 
    coverwrap, coverbleed, spinewidth, minpages, maxpages, numpages, coverimg, price, pages, userproductid, thumb) {
        this.id = id;
        this.guid = guid;
        this.name = name;
        this.datecreated = datecreated;
        this.productid = productid;
        this.pagewidth = pagewidth;
        this.pageheight = pageheight;
        this.pagebleed = pagebleed;
        this.usecover = usecover;
        this.coverwidth = coverwidth;
        this.coverheight = coverheight;
        this.coverwrap = coverwrap;
        this.coverbleed = coverbleed;
        this.spinewidth = spinewidth;
        this.minpages = minpages;
        this.maxpages = maxpages;
        this.numpages = numpages;
        this.coverimg = coverimg;
        this.price = price;
        this.pages = pages;
        this.userProductID = userproductid || -1;
        this.thumb = thumb;
    }
};