$(document).ready(function(){
    /**
     * ACCORDION 2.0
     * https://github.com/cant89/gianni-accordion-js
     */

    var myAccordion = new gianniAccordion({
    elements: ".card article",
            trigger: "[data-accordion-element-trigger]",
            content: "[data-accordion-element-content]",
    });

    /*myAccordion.on("elementSelected", (data)=>{
        console.log("elementOpened", data);
    });*/

});