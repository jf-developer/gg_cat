var lang = "pt";

var url = document.URL;
var urls = url.substr(url.lastIndexOf('?') + 1, url.length);
// lang = urls;
// console.log('urls'+urls)

var searchProductsArr = [];
var wish_list = new Array();
var _data;
var weightArr = [];

(function($) {
    
    $('.button-collapse').sideNav({ menuWidth: 150});
    $('.carousel.carousel-slider').carousel({full_width: true});


    /*** If there's ?pesquisa on adress bar it will show the find product menu ***/
    if (urls === "pesquisa") {
        lang = "pt";
        $('.default-blue').remove();
    } else {
        $('#searchHolder').remove();
        $('.wishlist').css({"display" : "none"});
    }

    /*** Load Json Object ***/
    var jsonData = $.getJSON("data.json", function (data) {
        _data = data;

        // Navigation
        var i = 0, navigation; 
        for (i; i < data.nav.length; i++){
            // Create Navigation
            navigation = $("<li id=" + data.nav[i].name.id + " name=" + data.nav[i].name[lang] + "><a>" + data.nav[i].name[lang] + "</a></li>");
            // Add Navigation to DOM Element
            $("#navigation, #nav-mobile").append(navigation);
        };
    });


    jsonData.done(function () {

        /* Navigation */ 
        $('ul.side-nav li, #navigation li').on("click", function() {

            $.address.value($(this).attr('id'));
            
            document.title += " | "+$(this).attr('name');

            /* Activate/Inactivate  Nav Button*/
            $('ul.side-nav li, #navigation li').removeClass("active");
            $(this).addClass("active");

            addProducts($(this).attr("id"));
        });
        
        
        $.address.init(function (event) {
            if ($.address.value().replace("/", "") === "") {$("#navigation li").first().trigger("click", function () {}); }
        }).change(function (event) {
            $("#navigation li#"+$.address.value().replace("/", "")).trigger("click", function (){})
        });
    });
    
})(jQuery);

var catalog = document.createElement('div');
catalog.className = "catalog";
$('.wrapper').append(catalog);


var dimensions2Txt;

function createProduct(obj) {
    
    var str = obj.copy;
    
    var product = document.createElement('div');
    product.className = 'product';
    $(".catalog").prepend(product);

    var titleTxt = document.createElement('div');
    titleTxt.className = 'title copy';
    titleTxt.innerHTML = str.title[lang];

    var refTxt = document.createElement('div');
    refTxt.className = 'reference copy';
    refTxt.innerHTML = '<b>Ref. </b>' +  str.ref;

    var dimensions1Txt = document.createElement('div');
    dimensions1Txt.className = 'dimensions1 copy';
    dimensions1Txt.innerHTML = "<b>Dim. </b>" + formatDimensionsOne(str.dimensions);
    
    dimensions2Txt = document.createElement('div');
    dimensions2Txt.className = 'dimensions2 copy';
    dimensions2Txt.innerHTML = "<b>Dim. </b>" + formatDimensionsTwo(str.dimensions);

    var description = document.createElement('div');
    description.className = 'description copy';
    description.innerHTML = str.description[lang];

    /*var weight = document.createElement('div');
    weight.className = 'weight copy';
    weight.innerHTML = str.weight[lang];*/

    var priceTxt = document.createElement('div');
    priceTxt.className = 'price copy';
    priceTxt.innerHTML = "<b>" +  str.price+"</b>";

    var imgHolder = document.createElement('div');  
    imgHolder.className = 'imgHolder zoom';

    var img = document.createElement("img");
    img.setAttribute("src",  obj.imagePath + str.image);
    img.setAttribute("class", "image");
    
    var boxes = $(".catalog").append(product);
    product.appendChild(imgHolder);
    imgHolder.appendChild(img);
    product.appendChild(titleTxt);
    product.appendChild(refTxt);
    product.appendChild(dimensions1Txt);
    product.appendChild(dimensions2Txt);
    product.appendChild(description);
    product.appendChild(priceTxt);
    //product.appendChild(weight);

    /* Image Zoom */
    $('.imgHolder').zoom({ on:'grab',duration:120, touch:true});    
}

function addProducts(cat) {
    /* Hide Side Nav */
    setTimeout(function(){ $('.button-collapse').sideNav('hide'); },10);
	
    /* Remove all nested dom elements */
	$('.catalog').remove();
    
    /* Create Product - DOM Element */
	var catalog = document.createElement('div');
    catalog.className = "catalog";
    $('.wrapper').append(catalog);
    
    var _cat = _data.products.categories[cat];
    
    var j = 0;
    for(j; j<_cat.details.length; j++){
        var prod = _cat.details[j];
        var obj = {imagePath:_cat.imagePath, copy:prod }
        createProduct(obj);
    };
}

function removeProduct(){
    $('.product').remove();
    searchProductsArr = [];
}

/*** Search Product by Ref. ***/
function searchProduct() {
    str = search.value.replace(/\s/g, "").toUpperCase();
        
    try {
        found = JSON.search(_data, '//item');

        var snapshot = Defiant.getSnapshot(_data);
//        found = JSON.search(snapshot, '//*[ref="'+str+'"]');
        imagePath = JSON.search(snapshot, '//*[ref="'+str+'"]/../imagePath');
        copy = JSON.search(snapshot, '//*[ref="'+str+'"]');

        /* if found referece on the json object add product */
        if(copy.length){
            
            searchProductsArr.push(copy);
            
            var obj = {imagePath:imagePath, copy:copy[0]}
            
            createProduct(obj);
            
//            searchStr = $("<li class='searchLi'>"+found[0].title[lang]+' | '+found[0].ref+'| '+found[0].price+"</li>")
            searchStr = "<tr class='wishlist-item' id='list_id_"+copy[0].ref+"'><td class='w-ptitle'>"+copy[0].title[lang]+"</td><td class='w-ref'>"+copy[0].ref+"</td><td class='w-weight'>"+copy[0].weight[lang]+"g</td><td class='w-price'>"+copy[0].price+"</td><td class='w-premove' wpid='"+copy[0].title[lang]+"'></td></tr>";
            
            $(".wishlist").append(searchStr);
            
            weightArr.push(Number(obj.copy.weight.pt))
            
            updateWeight();
            
            wish_list.push(copy[0].ref);
//            console.log(wish_list);
        }
    }
    catch (e) {
//        console.log(e); 
    }    
}

function createWeight()
{
        weightStr = "<tr class='wishlist-item'><td colspan='5' class='w-weight' id='w-weight'>" + weightArr + "g</td></tr>";
        $(".wishlist").append(weightStr);
}
createWeight();

function updateWeight()
{
    
    $("#w-weight").html( (weightArr.reduce(getSum) / 1000) + " Kg" );
//    $( "#w-weight" ).css( "border", "3px solid red" );
    console.log($("#w-weight"))
    console.log('updateWeight', weightArr.reduce(getSum))
}


function getSum(total, num) {
    return total + num;
}
   
/*** Format dimensions for PT and EN ***/
function formatDimensionsOne(obj) {
    var _dim1; 
    switch(lang){
            case "pt":
//            console.log(obj)
//            console.log(obj.dim1.dia1)
                if (obj.dim1.dia1 == "") { _dim1 = unitConverter(obj.dim1.w1)+"<b>(L),</b> "+unitConverter(obj.dim1.l1)+"<b>(C)</b>, "+unitConverter(obj.dim1.h1)+"<b>(A)</b>"; }
                else { _dim1 = unitConverter(obj.dim1.dia1)+"<b>(C),</b> "+unitConverter(obj.dim1.h1)+"<b>(A)</b>"; }

                break;
                
            case "en":
                if (obj.dim1.dia1 == "") { _dim1 = unitConverter(obj.dim1.w1)+"<b>(W),</b> "+unitConverter(obj.dim1.l1) +"<b>(L)</b>, "+unitConverter(obj.dim1.h1)+"<b>(H)</b>"; }
                else { _dim1 = unitConverter(obj.dim1.dia1)+"<b>(L),</b> "+unitConverter(obj.dim1.h1)+"<b>(H)</b>"; }
                break;
    }
    return _dim1;
};

function formatDimensionsTwo(obj) {
    var _dim2; 
       if(obj.dim2.dia2 == "" && obj.dim2.w2 == "") dimensions2Txt.style.display = "none"; 
        else
       switch(lang){
            case "pt":
            // dimensionsConverter(_dim2 = obj.dim2.w2)
                if (obj.dim2.dia2 == "") { _dim2 = unitConverter(obj.dim2.w2)+"<b>(L),</b> "+unitConverter(obj.dim2.l2)+"<b>(C)</b>, "+unitConverter(obj.dim2.h2)+"<b>(A)</b>"; }
                else { _dim2 = unitConverter(obj.dim2.dia2)+"<b>(C),</b> "+unitConverter(obj.dim2.h2)+"<b>(A)</b>"; }

                break;
                
            case "en":
                if (obj.dim2.dia2 == "") { _dim2 = unitConverter(obj.dim2.w2)+"<b>(W),</b> "+unitConverter(obj.dim2.l2)+"   <b>(L)</b>, "+unitConverter(obj.dim2.h2)+"<b>(H)</b>"; }
                else { _dim2 = unitConverter(obj.dim2.dia2)+"<b>(L),</b> "+unitConverter(obj.dim2.h2)+"<b>(H)</b>"; }
                break;
    }
    return _dim2;
};

function unitConverter(str)
{
    var unit;
    switch(lang){

        case "pt":
        case "en":
            if(str!= "") unit =  str+" cm ";
        break;
    }
    return unit;
}