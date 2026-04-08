an event matrix can be manual or CP generated with a set of constraints in an OR Tool micro service

# Event Matrix Documentation
An event matrix is a structured representation of events scheduled over a specific period. It can be created manually by users or generated automatically using Constraint Programming (CP) techniques through an OR-Tools microservice. This document outlines the key features, usage, and implementation details of the event matrix.
it takes care of constraints such as:

- No overlapping events for the same resource (e.g., room, person)
- Maximum number of events per day
- workload balance across resources

Manuel mode controls on single place of event