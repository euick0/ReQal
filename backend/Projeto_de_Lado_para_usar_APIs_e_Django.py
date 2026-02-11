from google_images_search import GoogleImagesSearch
gis = GoogleImagesSearch('AIzaSyDUc8iCBb_rvsUmeFzHC4xqLlPmfzLdUvA', 'e07383e00936748d7')

def image_Search(prompt):
    #API key, CSE_CX code

    #Parâmetros de busca
    _search_params = {
        'q': prompt, #prompt da imagem que vai ser procurada
        'num': 10,
        'fileType': 'jpg|png',
        'rights': 'cc_publicdomain|cc_attribute|cc_sharealike|cc_noncommercial|cc_nonderived',
        'safe': 'off', ##
        'imgType': 'photo', ##
        'imgSize': 'medium', ##
        'imgDominantColor': 'imgDominantColorUndefined', ##
        'imgColorType': 'color' ##
    }

    #Procura de imagens
    imagens = {}
    gis.search(search_params=_search_params)
    for image in gis.results():
        image.url  # image direct url
        image.referrer_url  # image referrer url (source) 
        imagens.append(image.url)

    #De alguma forma partilhar a lista imagens para o eric
    return imagens