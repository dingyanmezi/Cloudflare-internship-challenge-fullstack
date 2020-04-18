/**
 * Class ElementHandler responds to any incoming element, when attached using the
 * (.on) function of an HTMLRewriter instance
 * */
class ElementHandler {
  constructor(content){
    this.content = content
  }
  element(element) {
    element.setInnerContent(this.content)
  }
}

/**
 * Class RediectHandler responds to changing the attributes
 * */
class RedirectHandler{
  constructor(tag, link){
    this.tag = tag
    this.link = link
  }

  element(element){
    element.setAttribute(this.tag, this.link)
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


/**
 * Handle request by using A/B testing style to return each variant around 50% of the time.
 * @param {Request} request
 */
async function handleRequest(request) {

// check for cookie existence
  let cookies = request.headers.get('Cookie')
  let variant_got_from_cookie;
  if (cookies) {
      cookies = cookies.split(';')
      for (let i = 0; i < cookies.length; i++){
        let cookieName = cookies[i].split('=')[0]
        if (cookieName.trim() === 'variant') {
          variant_got_from_cookie = cookie.split('=')[1].trim()
          break
        }  
      }  
  }
  let chosenUrl;
  // if no cookie, start from the scratch; else get the cookie and fetch
  if (!variant_got_from_cookie){
    const url = 'https://cfw-takehome.developers.workers.dev/api/variants'
    const firstResponse = await fetch(url)
    const json = await firstResponse.json();
    const variants = json.variants
    chosenUrl = variants[Math.floor(Math.random() * variants.length)]
  }else{
    chosenUrl = await fetch(variant_got_from_cookie)
  }

  let newResponse = await fetch(chosenUrl)
  newResponse = new HTMLRewriter().on('title', new ElementHandler('Coding Challenge'))
      .on('h1#title', new ElementHandler('You dont know me. You are about to'))
      .on('p#description', new ElementHandler('This is the coding challenge for Cloudflare 2020 intern'))
      .on('a#url', new ElementHandler('Go Visit my github page!'))
      .on('a#url', new RedirectHandler('href', 'https://github.com/dingyanmezi'))
      .transform(newResponse)

  return newResponse
}
