"""
URL configuration for C8V2 project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="C8V2 API",
        default_version='v1',
        description="API documentation for C8V2 project",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@c8v2.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication URLs
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # API URLs
    path('api/questionnaire/', include('questionnaire.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/sms/', include('sms.urls')),
    path('api/email/', include('email_reader.urls')),
    
    # API Documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
