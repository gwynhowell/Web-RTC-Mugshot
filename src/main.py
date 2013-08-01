from google.appengine.api import users
from google.appengine.ext import db
import base64
import jinja2
import os
import webapp2

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'])

class Photo(db.Model):
    timestamp = db.DateTimeProperty(auto_now_add=True)
    user = db.UserProperty(auto_current_user_add=True)
    photo = db.BlobProperty()

class Home(webapp2.RequestHandler):
    def get(self):
        photos = Photo.gql('ORDER BY timestamp DESC').fetch(100)
        
        template_values = {'photos':photos,
                           'user':users.get_current_user(),
                           'login_url':users.create_login_url('/'),
                           'logout_url':users.create_logout_url('/')}
        
        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(template_values))
        
class Save(webapp2.RequestHandler):
    def post(self):
        b64_img = str(self.request.get('imgBase64').replace('data:image/png;base64,', ''))
        
        img = base64.b64decode(b64_img)
        key = Photo(photo=img).put()
        
        self.response.out.write(key.id())
        
class Crud(webapp2.RequestHandler):
    def get(self, photo_id):
        photo = Photo.get_by_id(long(photo_id))
        
        self.response.headers['Content-Type'] = 'image/png'
        self.response.out.write(photo.photo)
        
    def delete(self, photo_id):
        user = users.get_current_user()
        email = user.email() if user else None
        key = db.Key.from_path('Photo', long(photo_id))
        photo = db.get(key)
        if photo.user.email() == email:
            db.delete(key)
        else:
            self.abort(403)

app = webapp2.WSGIApplication(routes=[
                                      webapp2.Route('/', Home),
                                      webapp2.Route('/save', Save),
                                      webapp2.Route('/photo/<photo_id:.*>', Crud),
                                      ])