---
title: RE01 - Content Delivery Network
parent: Spikes and Research
---

## Overview

This document summarizes the research, documentation and testing of whether a
CDN network in front of the project to serve static assets are warranted, or
worth the investment in a truly impressive software engineering project.

Objective of this document is to check, given some large `.webp` images, already
optimized on the backend (around ~60kB average each image, largest at ~100kB),
would a CDN help?

## Testing Environment

- S3 provider: self-hosted RustFS, hosted in Germany.
- CDN provider: volume-tier BunnyCDN, with 10 PoPs in continents (to keep costs
  to performance ratio as high as possible)
- Testing machine: `oha` utility, in Southeast Asia.
- Testing parameters:
  - 50 concurrent connections
  - Runs for 30 seconds, continuously

### Testing Results (Straight from s3)

Raw oha results:

```plaintext
Summary:
  Success rate: 100.00%
  Total: 33.9790 sec
  Slowest: 7.4486 sec
  Fastest: 0.5695 sec
  Average: 1.3030 sec
  Requests/sec: 34.7568

  Total data: 121.22 MiB
  Size/request: 105.10 KiB
  Size/sec: 3.57 MiB

Response time histogram:
  0.570 sec [1]   |
  1.257 sec [610] |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  1.945 sec [446] |■■■■■■■■■■■■■■■■■■■■■■■
  2.633 sec [57]  |■■
  3.321 sec [36]  |■
  4.009 sec [15]  |
  4.697 sec [10]  |
  5.385 sec [5]   |
  6.073 sec [0]   |
  6.761 sec [0]   |
  7.449 sec [1]   |

Response time distribution:
  10.00% in 0.6335 sec
  25.00% in 0.8319 sec
  50.00% in 1.2522 sec
  75.00% in 1.4606 sec
  90.00% in 1.9668 sec
  95.00% in 2.7364 sec
  99.00% in 4.3589 sec
  99.90% in 5.2254 sec
  99.99% in 7.4486 sec


Details (average, fastest, slowest):
  DNS+dialup: 0.4454 sec, 0.3759 sec, 1.7829 sec
  DNS-lookup: 0.0001 sec, 0.0000 sec, 0.0008 sec

Status code distribution:
  [200] 1181 responses
```

Summary:

- Average is 1.3 seconds.
- Slowest is at 7.4 seconds.
- P95 is under 3 seconds.
- P99 is under 5 seconds.
- 34 requests per second.

### Testing Results (with CDN)

Raw oha results:

```plaintext
Summary:
  Success rate: 100.00%
  Total: 31.2137 sec
  Slowest: 4.4436 sec
  Fastest: 0.0931 sec
  Average: 0.5161 sec
  Requests/sec: 94.0933

  Total data: 299.09 MiB
  Size/request: 104.28 KiB
  Size/sec: 9.58 MiB

Response time histogram:
  0.093 sec [1]    |
  0.528 sec [2021] |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.963 sec [546]  |■■■■■■■■
  1.398 sec [206]  |■■■
  1.833 sec [123]  |■
  2.268 sec [23]   |
  2.703 sec [15]   |
  3.138 sec [0]    |
  3.573 sec [1]    |
  4.009 sec [0]    |
  4.444 sec [1]    |

Response time distribution:
  10.00% in 0.1495 sec
  25.00% in 0.2234 sec
  50.00% in 0.4014 sec
  75.00% in 0.6175 sec
  90.00% in 1.1850 sec
  95.00% in 1.4312 sec
  99.00% in 1.9422 sec
  99.90% in 2.6745 sec
  99.99% in 4.4436 sec


Details (average, fastest, slowest):
  DNS+dialup: 0.2122 sec, 0.0605 sec, 2.1947 sec
  DNS-lookup: 0.0001 sec, 0.0000 sec, 0.0004 sec

Status code distribution:
  [200] 2937 responses
```

Summary:

- Average is 0.5 seconds.
- Slowest is under 5 seconds.
- P90 is within 10% of 1 second.
- P99 is under 2 seconds.
- 94 requests per second.

### Testing Conclusion

The CDN-backed configuration reduced median response latency from approximately
1.25 s to 0.40 s (≈60–70% improvement) and increased request throughput from \~35
requests/sec to \~94 requests/sec (≈3× improvement). Tail latency was also
significantly improved, with 95th-percentile response times dropping from \~2.7s
to \~1.4 s and fewer extreme outliers.

CDN statistics further confirm the effectiveness of edge caching: out of 316.54MB
of total bandwidth served, 308.37 MB (~97.4%) was delivered from cache, resulting
in minimal origin traffic (8.17 MB uncached).

| Metric                 | Direct S3 | CDN                |
| ---------------------- | --------- | ------------------ |
| Median latency (p50)   | ~1.25 s   | ~0.40 s            |
| 95th percentile (p95)  | ~2.74 s   | ~1.43 s            |
| Max latency            | ~7.45 s   | ~4.44 s            |
| Requests per second    | ~35       | ~94                |
| Throughput             | ~3.6 MB/s | ~9.6 MB/s          |
| Total bandwidth served | 121.22 MB | 316.54 MB          |
| Cached bandwidth       | N/A       | 308.37 MB (~97.4%) |
| Uncached bandwidth     | N/A       | 8.17 MB (~2.6%)    |
