Add ssl to nginx and set redirect from 80 to ssl

```
server {
    server_name geo.rcntec.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;

    ssl on;
    ssl_certificate /etc/nginx/ssl/certificate.pem;
    ssl_certificate_key /etc/nginx/ssl/certificate.key;

    client_max_body_size 1G;
```
