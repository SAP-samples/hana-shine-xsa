package com.sap.refapps;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.apache.olingo.commons.api.data.Entity;
import org.apache.olingo.commons.api.data.Property;
import org.apache.olingo.commons.api.data.ValueType;
import org.apache.olingo.commons.api.http.HttpHeader;
import org.apache.olingo.server.api.OData;
import org.apache.olingo.server.api.ODataApplicationException;
import org.apache.olingo.server.api.ODataRequest;
import org.apache.olingo.server.api.deserializer.DeserializerResult;
import org.apache.olingo.server.api.prefer.Preferences;
import org.apache.olingo.server.api.uri.UriInfo;
import org.apache.olingo.server.api.uri.UriParameter;
import org.apache.olingo.server.api.uri.UriResourceEntitySet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sap.gateway.v4.rt.api.extensions.DataProviderExtensionContext;
import com.sap.gateway.v4.rt.api.extensions.ExtendDataProvider;
import com.sap.gateway.v4.rt.api.extensions.ExtensionContext;
import com.sap.gateway.v4.rt.api.extensions.RequestType;
import com.sap.gateway.v4.rt.cds.api.CDSDSParams;

public class Extensions {
	
	/**
	 * Static Logger.
	 */
	private static final Logger LOGGER = LoggerFactory.getLogger(Extensions.class);
	
	private static final String INSERT = "INSERT INTO \"UserData.User\"(\"UserId\",\"FirstName\",\"LastName\",\"Email\") VALUES" + " (?,?,?,?)" ;
	
	private static final String UPDATE = "UPDATE \"UserData.User\" SET " + "\"FirstName\"=?,\"LastName\"=?,\"Email\"=? WHERE \"UserId\"=" + "?";
	
	private static final String DELETE = "DELETE FROM \"UserData.User\"  WHERE \"UserId\"= ?";
	
	private static final String SELECT = "SELECT * FROM \"UserData.User\" WHERE " + '"' + "UserId" + '"' + '=' + "?";

	@ExtendDataProvider(entitySet = { "User" }, requestTypes = { RequestType.CREATE })
	public void createUser(ExtensionContext ectx) throws ODataApplicationException {
		LOGGER.info("Entered the method createUser");
		try {
			Connection conn = ((CDSDSParams) ectx.getDSParams()).getConnection();
			Statement idStmt = conn.createStatement();
			DataProviderExtensionContext dpCtx = ectx.asDataProviderContext();
			DeserializerResult payload = dpCtx.getDeserializerResult();
			Entity requestEntity = payload.getEntity();
			//Generate the object Id via the Sequence.
			String sequenceSQL = "select " + "\"userSeqId"+ "\".NEXTVAL  FROM " + "\"DUMMY\"";
			
			ResultSet sequenceRs = idStmt.executeQuery(sequenceSQL);
			while(sequenceRs.next()){
				Long keyVal = sequenceRs.getLong(1);
				LOGGER.debug("The Sequence Id for the User > " + keyVal);
				
				PreparedStatement pstmt = conn.prepareStatement(INSERT);
				pstmt.setString(1, keyVal.toString());
				pstmt.setString(2, (String) requestEntity.getProperty("FirstName").getValue());
				pstmt.setString(3, (String) requestEntity.getProperty("LastName").getValue());
				pstmt.setString(4, (String) requestEntity.getProperty("Email").getValue());
				pstmt.execute();
				
				LOGGER.debug("Inserted record for Id > " + keyVal);
				
				pstmt = conn.prepareStatement(SELECT);
				pstmt.setString(1, keyVal.toString());
				
				ResultSet rs = pstmt.executeQuery();
				Entity result = rs.next() ? createEntityFromResultSet(rs) : null;
				dpCtx.setResultEntity(result);
				LOGGER.debug("Data Successfully inserted");
			}
			conn.close();
			
			
		} catch (SQLException sqlException) {
			LOGGER.info("error while creating . . .");
			LOGGER.error(sqlException.getMessage());
			return;
		}
		finally{
			
		}
		LOGGER.info("Exiting the createUser method");
	}

	@ExtendDataProvider(entitySet = { "User" }, requestTypes = { RequestType.UPDATE })
	public void updateUser(ExtensionContext ectx) {
		LOGGER.info("Entered the updateUser method");
		DataProviderExtensionContext dpCtx = ectx.asDataProviderContext();

		try {
			Connection conn = ((CDSDSParams) ectx.getDSParams()).getConnection();
			DeserializerResult payload = ectx.asDataProviderContext().getDeserializerResult();
			Entity requestEntity = payload.getEntity();
			UriInfo ui = ectx.getUriInfo();
			UriResourceEntitySet uriResourceEntitySet = ((UriResourceEntitySet) ui.getUriResourceParts().get(0));
			String keyVal = requestEntity.getProperty("UserId").getValue().toString();
			List<UriParameter> kp = uriResourceEntitySet.getKeyPredicates();

			PreparedStatement pstmt = conn.prepareStatement(UPDATE);
			pstmt.setString(1, (String) requestEntity.getProperty("FirstName").getValue());
			pstmt.setString(2, (String) requestEntity.getProperty("LastName").getValue());
			pstmt.setString(3, (String) requestEntity.getProperty("Email").getValue());
			pstmt.setString(4, kp.get(0).getText());
			pstmt.execute();
			LOGGER.debug("Updated record for Id > " + keyVal);

			ODataRequest request = dpCtx.getODataRequest();
			final Preferences.Return returnPreference = OData.newInstance()
					.createPreferences(request.getHeaders(HttpHeader.PREFER)).getReturn();
			if (returnPreference == null || returnPreference == Preferences.Return.REPRESENTATION) {
				pstmt = conn.prepareStatement(SELECT);
				pstmt.setString(1, keyVal);
				ResultSet rs = pstmt.executeQuery();
				Entity result = rs.next() ? createEntityFromResultSet(rs) : null;
				dpCtx.setResultEntity(result);
			}
			conn.close();
		}

		catch (SQLException sqlException) {
			LOGGER.info("error during update");
			LOGGER.error(sqlException.getMessage());
		}

		LOGGER.info("Exiting the updateUser method");

	}

	@ExtendDataProvider(entitySet = { "User" }, requestTypes = { RequestType.DELETE })
	public void deleteUser(ExtensionContext ectx) {
		LOGGER.info("Entered the updateUser method");

		try {
			Connection conn = ((CDSDSParams) ectx.getDSParams()).getConnection();
			UriInfo ui = ectx.getUriInfo();
			UriResourceEntitySet uriResourceEntitySet = ((UriResourceEntitySet) ui.getUriResourceParts().get(0));
			List<UriParameter> kp = uriResourceEntitySet.getKeyPredicates();

			PreparedStatement pstmt = conn.prepareStatement(DELETE);
			pstmt.setString(1, kp.get(0).getText());
			pstmt.execute();
			conn.close();
			LOGGER.debug("Deleted record for Id > " + kp.get(0).getText());
			
		}

		catch (SQLException sqlException) {
			LOGGER.info("error during update");
			LOGGER.error(sqlException.getMessage());
		}

		LOGGER.info("Exiting the updateUser method");

	}

	private Entity createEntityFromResultSet(ResultSet rs) throws SQLException {

		Entity e = new Entity();
		ResultSetMetaData meta = rs.getMetaData();
		int columnCount = meta.getColumnCount();
		List<String> columns = new ArrayList<String>();
		for (int i = 1; i <= columnCount; i++)
			columns.add(meta.getColumnLabel(i));

		for (String column : columns)
			e.addProperty(new Property(null, column, ValueType.PRIMITIVE, rs.getObject(column)));

		return e;

	}
}
