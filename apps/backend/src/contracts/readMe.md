# Exemple Contract Aggregate

```mermaid
classDiagram
    class Contract {
      +ContractId id
      +string title
      +Date startDate
      +Date endDate
      +ContractStatus status
    }

    class Addendum {
      +AddendumId id
      +Date date
      +string text
    }

    Contract "1" o-- "*" Addendum : contains