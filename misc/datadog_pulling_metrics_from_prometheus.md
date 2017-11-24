---
layout: page
categories: [datadog, prometheus]
tags: [datadog, prometheus]
title: Pulling metrics from Prometheus in Datadog: How-to?
---

This page is a follow-up on the questions that followed https://github.com/DataDog/dd-agent/pull/3317.
It is intended to be a temporary documentation while the official documentation is being created.
If the offciial documentation already exists, just refer to the official documentation that is probably better and more up-to-date.

## How to create a datadog check that can pull metrics from Prometheus?

First, I'm going to suppose that **you already know how to create a check in Datadog**.
If you don't please refer to the [official documentation](https://docs.datadoghq.com/guides/agent_checks/).

### Simple example using the `kube_dns` check from the integration-code project

We are going to  use the [kube_dns check](https://github.com/DataDog/integrations-core/blob/master/kube_dns/check.py) as an example as it's an easy one.

The [`PrometheusCheck` class](https://github.com/DataDog/dd-agent/blob/master/checks/prometheus_check.py) is a class that already contains all the logic to pull metrics out of prometheus.
To use it you will have to import it and make your class inherit from it.

In the constructor of your class you will need (after executing the constructor of the parent class), to initialize:
* the `self.NAMESPACE` variable to the value of the prefix you want the metrics to have
* the `self.metrics_mapper` variable which is a dictionnary where:
  * the keys are the metrics to capture (the name in prometheus, i.e. `kubedns_kubedns_dns_response_size_bytes`). **Important:** do not include the brackets and what's after in the metrics name. Those are histogram buckets, we'll talk about those shortly
  * the values are the corresponding metrics names to have in datadog
 * __Optionally__ you can define the variable `self.ignore_metrics` which is an array that contains the list of prometheus metrics names you don't want to be processed. Some metrics are ignored because they are duplicates or introduce a very high cardinality. Metrics included in this list will be silently skipped without a 'Unable to handle metric' debug line in the logs
 * __Optionally__ you can define the variable `self.labels_mapper. If the `labels_mapper` dictionnary is provided, the metrics labels names in the `labels_mapper` will use the corresponding value as tag name when sending the gauges.
  * __Optionally__ you can define the variable `self.exclude_labels`. `exclude_labels` is an array of labels names to exclude. Those labels will just not be added as tags when submitting the metric.
  * __Optionally__ you can define the variable `self.type_overrides`. `type_overrides` is a dictionnary where the keys are prometheus metric names and the values are a metric type (name as string) to use instead of the one listed in the payload. It can be used to force a type on untyped metrics.
 
So in our example that corresponds to:
```python
from checks import CheckException
from checks.prometheus_check import PrometheusCheck

EVENT_TYPE = SOURCE_TYPE_NAME = 'kubedns'

class KubeDNSCheck(PrometheusCheck):
    """
    Collect kube-dns metrics from Prometheus
    """
    def __init__(self, name, init_config, agentConfig, instances=None):
        super(KubeDNSCheck, self).__init__(name, init_config, agentConfig, instances)
        self.NAMESPACE = 'kubedns'

        self.metrics_mapper = {
            # metrics have been renamed to kubedns in kubernetes 1.6.0
            'kubedns_kubedns_dns_response_size_bytes': 'response_size.bytes',
            'kubedns_kubedns_dns_request_duration_seconds': 'request_duration.seconds',
            'kubedns_kubedns_dns_request_count_total': 'request_count',
            'kubedns_kubedns_dns_error_count_total': 'error_count',
            'kubedns_kubedns_dns_cachemiss_count_total': 'cachemiss_count',
            # metrics names for kubernetes < 1.6.0
            'skydns_skydns_dns_response_size_bytes': 'response_size.bytes',
            'skydns_skydns_dns_request_duration_seconds': 'request_duration.seconds',
            'skydns_skydns_dns_request_count_total': 'request_count',
            'skydns_skydns_dns_error_count_total': 'error_count',
            'skydns_skydns_dns_cachemiss_count_total': 'cachemiss_count',
        }
```

Once you've done that you will need to add a `check` method to your class.
The best way to go in this class is just to call the `process` method of the mother class using `self.process`.
This function takes a few arguments:
* `endpoint` is the prometheus endpoint to use. For example: `http://localhost:10055/metric`
* `send_histograms_buckets` (defaults to `True`) chooses or not to send the histogram buckets of your prometheus metrics (the stuff inside the brackets for your prometheus metrics) or to just send the metric value and skipping the histograms. The histograms buckets can create a lot of tags and metrics, so if you don't need it, just set that to false.
* `instance` (defaults to `None`). For this one, just pass the instance that the agent provided when calling your check method.

```python
    def check(self, instance):
        endpoint = instance.get('prometheus_endpoint')
        if endpoint is None:
            raise CheckException("Unable to find prometheus_endpoint in config file.")

        send_buckets = instance.get('send_histograms_buckets', True)
        # By default we send the buckets.
        if send_buckets is not None and str(send_buckets).lower() == 'false':
            send_buckets = False
        else:
            send_buckets = True

        self.process(endpoint, send_histograms_buckets=send_buckets, instance=instance)
```

### Going further

The [`PrometheusCheck` class](https://github.com/DataDog/dd-agent/blob/master/checks/prometheus_check.py) can allow you to go further in your usage of prometheus. For example, if you are really allergic to the protobuf format the check is capable of pulling the metrics using the text format.
You can also specify custom headers when calling prometheus.
All you would have to do in this case is copy/paste the `process` method inside your `check` method and provide the other arguments to the `poll` method.

But if you go that far I guess you can read the code and the pydoc that goes with it, so going further in this doc would be useless. Have fun then! ;)
