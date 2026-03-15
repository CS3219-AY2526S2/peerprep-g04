package collaborationservice.demo.entity;

import java.util.List;

/**
 * Container used if the matching service wants to send a batch of events.
 */
public class RequestPackage {
    private List<Request> requests;

    public List<Request> getRequests() {
        return requests;
    }

    public void setRequests(List<Request> requests) {
        this.requests = requests;
    }
}
