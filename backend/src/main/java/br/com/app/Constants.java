package br.com.app;

public class Constants {

    public enum UserType {
        ADMIN(0),
        USER(1);

        private final int value;

        UserType(int value) {
            this.value = value;
        }

        public int getValue() {
            return value;
        }

        public static UserType fromValue(int value) {
            for (UserType type : UserType.values()) {
                if (type.value == value) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Invalid UserType value: " + value);
        }
    }

    public enum Status {
        ACTIVE(0),
        INACTIVE(1);

        private final int value;

        Status(int value) {
            this.value = value;
        }

        public int getValue() {
            return value;
        }

        public static Status fromValue(int value) {
            for (Status status : Status.values()) {
                if (status.value == value) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid Status value: " + value);
        }
    }

    public enum CategoryType {
        RECEIPT(0),
        EXPENSE(1);

        private final int value;

        CategoryType(int value) {
            this.value = value;
        }

        public int getValue() {
            return value;
        }

        public static CategoryType fromValue(int value) {
            for (CategoryType categoryType : CategoryType.values()) {
                if (categoryType.value == value) {
                    return categoryType;
                }
            }
            throw new IllegalArgumentException("Invalid CategoryType value: " + value);
        }
    }

    public enum TransactionStatus {
        PENDING(0),
        PAID(1),
        PARTIALLY_PAID(2),
        CANCELED(3),
        DELETED(4);

        private final int value;

        TransactionStatus(int value) {
            this.value = value;
        }

        public int getValue() {
            return value;
        }

        public static TransactionStatus fromValue(int value) {
            for (TransactionStatus status : TransactionStatus.values()) {
                if (status.value == value) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid TransactionStatus value: " + value);
        }
    }
}
