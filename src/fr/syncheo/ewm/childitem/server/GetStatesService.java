package fr.syncheo.ewm.childitem.server;

import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.core.runtime.IProgressMonitor;

import com.ibm.team.repository.common.json.JSONArray;
import com.ibm.team.repository.common.json.JSONObject;
import com.ibm.team.repository.common.IContributor;
import com.ibm.team.repository.common.IContributorHandle;
import com.ibm.team.repository.common.TeamRepositoryException;
import com.ibm.team.repository.service.IRepositoryItemService;
import com.ibm.team.repository.service.TeamRawService;
import com.ibm.team.workitem.service.IWorkItemServer;
import com.ibm.team.workitem.common.model.IState;
import com.ibm.team.workitem.common.model.IWorkItem;
import com.ibm.team.workitem.common.model.Identifier;
import com.ibm.team.workitem.common.workflow.IWorkflowAction;
import com.ibm.team.workitem.common.workflow.IWorkflowInfo;
/**
 * Service côté serveur pour récupérer ou calculer les enfants d'un workitem
 */
public class GetStatesService extends TeamRawService implements IGetStatesService {

    @Override
    public void perform_GET(String uri, HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
    	
 
    	String workItemIdStr = request.getParameter("workItemId");
    	if (workItemIdStr == null) {
    		response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing workItemId");
    		return;
    	}

    	IWorkItemServer workItemService = getService(IWorkItemServer.class);
    	
    	int workItemId;
        try {
        	workItemId = Integer.parseInt(workItemIdStr);
        } catch (NumberFormatException e) {
        	response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid workItemId");
        	return;
        }
        
    	JSONObject json = new JSONObject();
    	
    	String username = loggedIn();
    	json.put("loggedInUser", username);
    	

        
        IWorkItem wi;
		try {
			wi = workItemService.findWorkItemById(workItemId, IWorkItem.DEFAULT_PROFILE, null);
			JSONArray states = getPossibleTargetStates(wi, null);
				
			json.put("states", states);
		} catch (TeamRepositoryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        
    	
        response.setCharacterEncoding(StandardCharsets.UTF_8.toString());
        response.setContentType("application/json");
        // Configurer la réponse

        PrintWriter writer = response.getWriter();
        writer.write(json.toString());
    }

 // Méthode utilitaire côté serveur
    public JSONArray getPossibleTargetStates(IWorkItem workItem, IProgressMonitor monitor)
            throws TeamRepositoryException {

    	JSONArray rex = new JSONArray();
        IWorkItemServer workItemService = getService(IWorkItemServer.class);
        IWorkflowInfo workflowInfo = workItemService.findWorkflowInfo(workItem, monitor);

        Identifier<IWorkflowAction>[] availableActions = workflowInfo.getActionIds(workItem.getState2());

        for (Identifier<IWorkflowAction> action : availableActions) {
        	Identifier<IState> resultState = workflowInfo.getActionResultState(action);
        	
        	JSONObject json = new JSONObject();
        	JSONObject actObj = new JSONObject();
        	actObj.put("id", action.getStringIdentifier());
        	actObj.put("name", workflowInfo.getActionName(action));
        	
        	JSONObject stateObj = new JSONObject();
        	stateObj.put("id", resultState.getStringIdentifier());
        	stateObj.put("name", workflowInfo.getStateName(resultState));
        	
        	json.put("action", actObj);
        	json.put("state", stateObj);  
        	rex.add(json);
        }
        return rex;
    }


	public String loggedIn() {
		 // Récupérer l'utilisateur connecté
		
		IContributorHandle userHandle = getAuthenticatedContributor();	    	 
        IRepositoryItemService iRepoItemService = getService(IRepositoryItemService.class);
	    String username = "unknown";

	    if (userHandle != null) {
	        try {
	        	
	        	IContributor user = (IContributor) iRepoItemService.fetchItem(userHandle, null)	;        	
	            username = user.getUserId(); // ou getName() selon ce que tu veux
	        } catch (Exception e) {
	            e.printStackTrace();
	        }
	    }

	    return username;
	}
}