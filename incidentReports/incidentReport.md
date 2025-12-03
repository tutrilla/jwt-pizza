# Incident: 2025-12-02 13-45-00

## Summary

At the hour of 12:35 pm on 12/2/25, all active users encountered failure when purchasing pizzas. The event was triggered by the pizza factory api going down at 12:35 pm. The factory api going down was due to a chaos test that was performed.

The event was detected by Grafana. The on-call team started working on the event by logging in first and using a test account to test whether the feature was down for purchasing features, checking cloudwatch, and then checking the JSON response when purchasing a pizza in dev tools. This high severity incident affected 100% of users.

## Detection

This incident was detected when the on-call team noticed on the metrics in Grafana that pizza purchases was down and purchase failures was up.

The team will set-up tighter boundaries for purchase failures so that if the metric was to increase again in the future that it will trigger the on-call team earlier and notify them so that there doesn't need an individual constantly monitoring the metrics.

## Impact

For 41 minutes between 19:35 UTC and 20:16 UTC on 12/02/25, our users were unable to purchase pizzas.

This incident affected 2 customers, who experienced an error when trying to purchase a pizza.

No support tickets or social media were submitted.

## Timeline

All times are UTC.

- _19:35_ - Pizza factory service went down
- _19:45_ - On-call team noticed and went to investigate
- _19:50_ - On-call team logged in and tried to purchase pizza, which resulted in an error
- _19:52_ - Went to see the error in dev tools and then went to cloudwatch to see the response
- _20:00_ - Realized that the error response logs were not showing up in cloudwatch, explore other locations in AWS to see for better results
- _20:14_ - Recalled that you can see response errors in dev tools, went and saw link to restore the pizza factory service
- _20:16_ - Restored pizza factory service


## Response

After receiving looking at metrics at 19:45, Thomas Utrilla came online at 19:45 UTC in Grafana.

## Root cause

The pizza factory service going down was an result of a chaos test performed on the system to test whether protocols and alerts were properly setup in order to recover effectively when a system goes down.

To prevent a failure where pizza's purchases were unable to be done, a plan will need to be made where 

## Resolution

The service was restored when in the response object that the error produced it was noted that there was a link to restore the service back online. Once visited, the service was back online and users could purchase pizzas again. In the JWT Pizza Factory settings, chaos turned status to calm.

To improve time to mitigate, firstly we can readjust the metrics for the alert so that when purchase failures increase only by a little that the alarm can go off and it can be checked. Secondly, we can either defensively program so that a back-up service can be called that can purchase pizzas, or create documentation on how to remedy the solution. The former is better.

## Prevention

This same root cause resulted in incidents where purchase flow stopped, and errors requests increased.

## Action items

1. Tighten alerts for purchase failures to go off when 2 or more purchase failures are happening per minute.
2. Create a alert for when bitcoin purchases go down.
3. Program a backup service for when purchase failures occur.

These action items are assigned to the following member: Thomas Utrilla
