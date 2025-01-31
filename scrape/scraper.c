#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <curl/curl.h>
#include <libxml/parser.h>
#include <libxml/tree.h>
#include <libxml/HTMLparser.h>
#include <libxml/xpath.h>
#include <libxml/xpathInternals.h>

/* Mia Lassiter

Web Scraper

From a single web page:
    downloads HTML content
    parses HTML
    scrapes data
    exports data to a file

Compilation:
gcc scraper.c -o scraper -lcurl -lxml2
*/

#define MAX_DATA 100

typedef struct {
    char *img;
    //metadata that will be displayed in string form
} METADATA;

struct CURLresp {
    char *html; //points to dynamically allocated memory block that stores HTML response
    size_t size;
}; //data struct for html doc

//fn called by libcurl whenever new data is received
static size_t HTMLcallback(void *contents, size_t size, size_t nmemb, void *userp) {
    size_t realsize = size *nmemb;
    struct CURLresp *mem = (struct CURLresp *)userp;
    char *ptr = realloc(mem->html, mem->size + realsize + 1); //resize html buffer, add a space for null terminator

    if(!ptr) {
        printf("failed memory allocation\n");
        return 0;
    }

    //copies new data into buffer, updates total size, add null terminator
    mem->html = ptr;
    memcpy(&(mem->html[mem->size]), contents, realsize);
    mem->size += realsize;
    mem->html[mem->size] = 0;

    return realsize;
}

struct CURLresp GetReq(CURL *curl_handle, const char *url) {
    CURLcode res;
    struct CURLresp response;

    //initialize response
    response.html = malloc(1);
    response.size = 0;

    curl_easy_setopt(curl_handle, CURLOPT_URL, url); //specify URL
    curl_easy_setopt(curl_handle, CURLOPT_WRITEFUNCTION, HTMLcallback); //pass data to callback fn
    curl_easy_setopt(curl_handle, CURLOPT_WRITEDATA, (void *)&response); //pass response to callback fn
    curl_easy_setopt(curl_handle, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko Chrome/117.0.0.0 Safari/537.36"); //set User-Agent header

    res = curl_easy_perform(curl_handle); //perform GET request
    if(res != CURLE_OK) {
        printf("GET request failed \n");
    }

    return response;
}

int main() {
    curl_global_init(CURL_GLOBAL_ALL); //global initialization
    CURL *curl_handle = curl_easy_init();//initialize cURL instance

    //initialize array that contains scraped data
    METADATA metadata[MAX_DATA];
    int ct = 0;

    //get HTML doc associated with page
    /*
        NEED TO PASS IN URL FROM PROXY CODE
    */
    struct CURLresp response = GetReq(curl_handle, "https://www.scu.edu/");
    printf("%s \n", response.html);

    //parse the HTML char * content, produce a tree
    htmlDocPtr doc = htmlReadMemory(response.html, (unsigned long)response.size, NULL, NULL, HTML_PARSE_NOERROR);

    /*
    NEED TO DO: Define selection strategy
        assess DOM
        retrieve specific elements
    This code has an example selector
    */
    xmlXPathContextPtr context = xmlXPathNewContext(doc);
    xmlXPathObjectPtr elts = xmlXPathEvalExpression((xmlChar *)"//li[contains(@class, 'product')]", context);

   //iterate over selected content nodes and extract metadata 
   for (int i = 0; i < elts->nodesetval->nodeNr; ++i) {
    xmlNodePtr curElt = elts->nodesetval->nodeTab[i]; //get current elt of loop

    //set context to restrict XPath selectors to the children of the current elt
    xmlXPathSetContextNode(curElt, context);
    xmlNodePtr img_elt = xmlXPathEvalExpression((xmlChar *)".//a/img", context)->nodesetval->nodeTab[0];
    //add selectors for other elements in the METADATA struct...

    //store scraped data in a METADATA instance
    METADATA mdata;
    mdata.img = strdup(img_elt);
    //add for other elts in struct...

    free(img_elt);
    //free other elts in struct


    //add to array
    metadata[ct] = mdata;
    ct++;
   } //end for loop

   free(response.html);
   xmlXPathFreeContext(context);
   xmlFreeDoc(doc);
   xmlCleanupParser();
   curl_easy_cleanup(curl_handle);
   curl_global_cleanup();

    //CONNECT TO DB
    
    /* 
    write each struct's data to db

    for(int i = 0; i < ct; i++) {
        //add metadata[i].img and other elts in struct
    }//end for

    */

   for (int i = 0; i < ct; i++) {
        free(metadata[i].img);
        //add other elts
   }

    return 0;
}