from flask import request
import json
import urllib.parse


class Body(object):

    @staticmethod
    def get_body():

        body = request.data

        if type(request.data) is not str:
            body = request.data.decode("utf-8")

        if body:
            body = json.loads(body)
        else:
            body = ''

        return body

    @staticmethod
    def get_params(param='payload', is_json=True):

        body = str(request.args.get(param))
        body = urllib.parse.unquote(body)

        #if type(request.data) is not str:
        #    body = request.data.decode("utf-8")

        if is_json and body:
            return json.loads(body)
        elif not is_json:
            return body
        else:
            return ''
