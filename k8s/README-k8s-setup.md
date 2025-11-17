# Kubernetes Setup for Uniconnect LearningHub

This guide will help you deploy your backend and frontend on Kubernetes for high concurrency, speed, and scalability.

## Prerequisites
- Kubernetes cluster (e.g., on your VPS, cloud, or local with minikube/kind)
- `kubectl` installed and configured
- Ingress controller installed (e.g., NGINX or Traefik)
- Docker images for backend and frontend pushed to a registry accessible by your cluster

## 1. Prepare Environment Variables
Create a Kubernetes Secret for backend environment variables (from your `.env` file):

```sh
kubectl create secret generic backend-env --from-env-file=backend/src/.env
```

## 2. Deploy Backend

```sh
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-hpa.yaml
```

## 3. Deploy Frontend

```sh
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-hpa.yaml
```

## 4. Set Up Ingress

Edit `k8s/ingress.yaml` to add TLS for HTTPS (recommended for production). Example with cert-manager:

```yaml
spec:
  tls:
    - hosts:
        - www.uniconnect-learninghub.co.ke
      secretName: tls-secret
```

Apply Ingress:

```sh
kubectl apply -f k8s/ingress.yaml
```

## 5. Scaling and Performance

- **Autoscaling:** HPA will automatically scale pods based on CPU usage.
- **Resource Limits:** Tune `resources.requests` and `resources.limits` in deployments for your hardware.
- **Rolling Updates:** Update images/tags in deployments and apply for zero-downtime upgrades.
- **Monitoring:** Use `kubectl get pods`, `kubectl top pods`, and install monitoring tools (Prometheus, Grafana).

## 6. Troubleshooting

- Check pod logs: `kubectl logs <pod-name>`
- Describe resources: `kubectl describe <resource> <name>`
- Check events: `kubectl get events`

## 7. Best Practices

- Always use resource requests/limits for predictable scaling.
- Use readiness/liveness probes for reliability.
- Secure your cluster and use HTTPS for Ingress.
- Monitor usage and tune HPA thresholds as needed.

---

**You are now ready to run your service with high concurrency and scalability!**
